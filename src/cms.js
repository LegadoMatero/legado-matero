import { supabase } from './supabase'

export const CMS_KEYS = {
  SITE_CONTENT: 'site-content',
  SERVICES: 'services',
  ABOUT_POINTS: 'about-points',
  CATEGORIES: 'categories',
  PUBLICATIONS: 'publications',
  PORTFOLIO: 'portfolio',
}

export function isDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:')
}

function dataUrlToBlob(dataUrl) {
  const [header, body] = dataUrl.split(',')
  const mimeMatch = header.match(/data:(.*?);/)
  const mime = mimeMatch?.[1] || 'image/jpeg'
  const binary = atob(body)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return new Blob([bytes], { type: mime })
}

export async function loadDocument(key) {
  const { data, error } = await supabase
    .from('cms_documents')
    .select('value')
    .eq('key', key)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data?.value ?? null
}

export function formatCmsError(error) {
  return (
    error?.message ||
    error?.error ||
    error?.details ||
    'Error desconocido al hablar con Supabase.'
  )
}

export async function saveDocument(key, value) {
  const { error } = await supabase.from('cms_documents').upsert(
    {
      key,
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' },
  )

  if (error) {
    throw new Error(
      `No se pudo guardar "${key}": ${formatCmsError(error)}`,
    )
  }
}

export async function uploadDataUrl(folder, dataUrl) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('La sesión expiró. Volvé a iniciar sesión.')
  }

  const blob = dataUrlToBlob(dataUrl)
  const path = `${folder}/${crypto.randomUUID()}.jpg`

  const { error } = await supabase.storage.from('site-media').upload(path, blob, {
    contentType: blob.type || 'image/jpeg',
    upsert: false,
  })

  if (error) {
    throw new Error(
      `No se pudo subir la imagen: ${formatCmsError(error)}`,
    )
  }

  const { data } = supabase.storage.from('site-media').getPublicUrl(path)

  return data.publicUrl
}

export async function persistPublicationImages(publications) {
  const next = []

  for (const publication of publications) {
    const images = []

    for (const image of publication.images || []) {
      const url = isDataUrl(image.url)
        ? await uploadDataUrl(`publications/${publication.id}`, image.url)
        : image.url

      images.push({
        ...image,
        url,
      })
    }

    const originalCoverIndex = (publication.images || []).findIndex(
      (image) => image.url === publication.coverImage,
    )

    let coverImage = publication.coverImage || ''

    if (originalCoverIndex >= 0) {
      coverImage = images[originalCoverIndex]?.url || coverImage
    } else if (isDataUrl(coverImage)) {
      coverImage = await uploadDataUrl(
        `publications/${publication.id}`,
        coverImage,
      )
    }

    next.push({
      ...publication,
      images,
      coverImage,
    })
  }

  return next
}

export async function persistPortfolioImages(portfolio) {
  const next = []

  for (const project of portfolio) {
    let image = project.image || ''

    if (isDataUrl(image)) {
      image = await uploadDataUrl(`portfolio/${project.id}`, image)
    }

    const screenshots = []

    for (const screenshot of project.screenshots || []) {
      screenshots.push(
        isDataUrl(screenshot)
          ? await uploadDataUrl(`portfolio/${project.id}`, screenshot)
          : screenshot,
      )
    }

    next.push({
      ...project,
      image,
      screenshots,
    })
  }

  return next
}

export function mergeSiteContent(defaults, saved) {
  if (!saved || typeof saved !== 'object') {
    return defaults
  }

  return {
    ...defaults,
    ...saved,
    home: {
      ...defaults.home,
      ...(saved.home || {}),
    },
    services: {
      ...defaults.services,
      ...(saved.services || {}),
    },
    about: {
      ...defaults.about,
      ...(saved.about || {}),
    },
    catalog: {
      ...defaults.catalog,
      ...(saved.catalog || {}),
    },
    contact: {
      ...defaults.contact,
      ...(saved.contact || {}),
    },
  }
}

export function readLocalFallback(key, fallback) {
  try {
    const saved = localStorage.getItem(key)

    if (!saved) {
      return fallback
    }

    return JSON.parse(saved)
  } catch {
    return fallback
  }
}

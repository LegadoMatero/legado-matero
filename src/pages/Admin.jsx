import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import defaultHeroMain from '../assets/banner-contacto.jpg'
import defaultHeroDetail from '../assets/banner-productos.jpg'
import {
  CMS_KEYS,
  formatCmsError,
  isDataUrl,
  loadDocument,
  mergeSiteContent,
  persistPortfolioImages,
  persistPublicationImages,
  saveDocument,
  uploadDataUrl,
} from '../cms'
import './Admin.css'

const cleanSectionLabel = (value) => String(value || '').replace(/^\s*\d{1,2}\s*[\/\-–—]\s*/, '')

function Admin() {
  const [checkingSession, setCheckingSession] = useState(true)
  const [activeSection, setActiveSection] = useState('inicio')

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        window.location.href = '/admin'
        return
      }

      setCheckingSession(false)
    }

    checkSession()
  }, [])

  const defaultSiteContent = {
    home: {
      eyebrow: 'TRADICIÓN · FAMILIA · LEGADO',
      title: 'No vendemos mates. Compartimos un legado.',
      description:
      'Cada mate tiene una historia. Nosotros queremos ayudarte a seguir compartiéndola.',
      button: 'Conocé nuestros mates',
      whatsappButton: 'Consultar por WhatsApp',
      heroMainImage: '',
      heroDetailImage: '',
    },

    services: {
      eyebrow: '01 / PRODUCTOS',
      featuredProductIds: null,
      title: 'Mates y accesorios con historia.',
      description:
      'Seleccionamos y cuidamos cada mate, termo y bombilla para que sigan acompañando charlas, familias y amistades.',
    },

    about: {
      eyebrow: '02 / NOSOTROS',
      title: 'El legado continúa.',
      lead:
      'LEGADO MATERO es una marca argentina de mates y accesorios que mantiene viva la tradición del mate y todo lo que representa.',
      description:
      'El nombre representa el legado que recibimos de nuestros abuelos y familias, y que seguimos transmitiendo generación tras generación.',
    },

    catalog: {
      eyebrow: '03 / CATÁLOGO',
      title: 'Nuestros mates y accesorios.',
      description:
      'Conocé nuestros productos disponibles. Cada mate y cada accesorio está pensado para acompañarte.',
    },

    contact: {
      eyebrow: '04 / CONTACTO',
      title: 'Sigamos compartiendo el legado.',
      description:
      '¿Tenés dudas sobre nuestros mates o accesorios? Escribinos, con gusto te ayudamos.',
      whatsapp: '',
      linkedin: '',
      instagram: '',
      fiverr: '',
      email: 'contacto@legadomatero.com.ar',
      bannerImage: '',
    },
  }

  const defaultServices = [
    {
      id: 1,
      number: '01',
      title: 'MATES',
      description:
        'Mates de calabaza, torpedo y camionero, curados y listos para usar, con guarda y detalles artesanales.',
    },
    {
      id: 2,
      number: '02',
      title: 'TERMOS Y BOMBILLAS',
      description:
        'Termos de acero inoxidable y bombillas de alpaca pensados para mantener la temperatura y la tradición.',
    },
    {
      id: 3,
      number: '03',
      title: 'SETS Y REGALOS',
      description:
        'Sets de mate armados para regalar: mate, termo y bombilla combinados, con presentación cuidada.',
    },
  ]

  const defaultAboutPoints = [
    {
      id: 1,
      number: '01',
      title: 'TRADICIÓN',
      description:
        'Mantenemos vivas las costumbres del mate compartido en familia.',
    },
    {
      id: 2,
      number: '02',
      title: 'FAMILIA',
      description:
        'Cada producto está pensado para acompañar charlas y encuentros.',
    },
    {
      id: 3,
      number: '03',
      title: 'LEGADO',
      description:
        'Un mate que se hereda y se sigue compartiendo generación tras generación.',
    },
  ]

  const [siteContent, setSiteContent] = useState(() => {
    try {
      const saved = localStorage.getItem(
        'legado-matero-site-content',
      )

      if (!saved) {
        return defaultSiteContent
      }

      const parsed = JSON.parse(saved)

      return {
        home: {
          ...defaultSiteContent.home,
          ...(parsed.home || {}),
        },
        services: {
          ...defaultSiteContent.services,
          ...(parsed.services || {}),
        },
        about: {
          ...defaultSiteContent.about,
          ...(parsed.about || {}),
        },
        catalog: {
          ...defaultSiteContent.catalog,
          ...(parsed.catalog || {}),
        },
        contact: {
          ...defaultSiteContent.contact,
          ...(parsed.contact || {}),
        },
      }
    } catch (error) {
      console.error(
        'No se pudo cargar la configuración:',
        error,
      )

      return defaultSiteContent
    }
  })

  const [services, setServices] = useState(() => {
    try {
      const saved = localStorage.getItem(
        'legado-matero-services',
      )

      if (!saved) {
        return defaultServices
      }

      const parsed = JSON.parse(saved)

      if (!Array.isArray(parsed)) {
        return defaultServices
      }

      return parsed
    } catch (error) {
      console.error(
        'No se pudieron cargar los servicios:',
        error,
      )

      return defaultServices
    }
  })

  const [aboutPoints, setAboutPoints] = useState(() => {
    try {
      const saved = localStorage.getItem(
        'legado-matero-about-points',
      )

      if (!saved) {
        return defaultAboutPoints
      }

      const parsed = JSON.parse(saved)

      if (!Array.isArray(parsed)) {
        return defaultAboutPoints
      }

      return parsed
    } catch (error) {
      console.error(
        'No se pudieron cargar los puntos de Nosotros:',
        error,
      )

      return defaultAboutPoints
    }
  })

  const defaultCategories = [
    {
      id: 1,
      name: 'Sitios Web',
      description:
        'Diseño y desarrollo de sitios web.',
    },
    {
      id: 2,
      name: 'Inteligencia Artificial',
      description:
        'Soluciones y automatizaciones con IA.',
    },
  ]

  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(
        'legado-matero-categories',
      )

      if (!saved) {
        return defaultCategories
      }

      const parsed = JSON.parse(saved)

      if (!Array.isArray(parsed)) {
        return defaultCategories
      }

      return parsed
    } catch (error) {
      console.error(
        'No se pudieron cargar las categorías:',
        error,
      )

      return defaultCategories
    }
  })

  const defaultPublications = [
    {
      id: 1,
      order: 1,
      type: 'Servicio',
      title: 'Diseño y desarrollo web',
      category: 'Sitios Web',
      images: [],
      coverImage: '',
      description:
        'Diseñamos y desarrollamos sitios web modernos, profesionales y adaptados a cada proyecto.',
      price: '',
      features:
        'Diseño personalizado\nResponsive\nOptimización\nPublicación',
      commercialInfo:
        'Consultá por disponibilidad y presupuesto personalizado.',
      published: true,
    },
    {
      id: 2,
      order: 2,
      type: 'Servicio',
      title: 'Automatizaciones con IA',
      category: 'Inteligencia Artificial',
      images: [],
      coverImage: '',
      description:
        'Creamos soluciones con inteligencia artificial para automatizar tareas y mejorar procesos.',
      price: '',
      features:
        'Análisis de necesidades\nAutomatización\nIntegración con herramientas\nSoporte',
      commercialInfo:
        'Consultá por una propuesta personalizada.',
      published: true,
    },
    {
      id: 3,
      order: 3,
      type: 'Servicio',
      title: 'Producción audiovisual',
      category: 'Sitios Web',
      images: [],
      coverImage: '',
      description:
        'Creamos piezas audiovisuales pensadas para comunicar marcas, productos y proyectos.',
      price: '',
      features:
        'Concepto creativo\nEdición\nMotion graphics\nEntrega digital',
      commercialInfo:
        'Consultá por formatos y presupuesto.',
      published: false,
    },
  ]

  const [publications, setPublications] = useState(() => {
    try {
      const saved = localStorage.getItem(
        'legado-matero-publications',
      )

      if (!saved) {
        return defaultPublications
      }

      const parsed = JSON.parse(saved)

      if (!Array.isArray(parsed)) {
        return defaultPublications
      }

      return parsed.map((publication, index) => {
        if (
          publication.image &&
          (!publication.images ||
            publication.images.length === 0)
        ) {
          return {
            ...publication,
            order:
              Number.isFinite(
                Number(publication.order),
              ) &&
              Number(publication.order) > 0
                ? Number(publication.order)
                : index + 1,
            images: [
              {
                id: `legacy-${publication.id}`,
                url: publication.image,
              },
            ],
            coverImage:
              publication.coverImage ||
              publication.image,
          }
        }

        return {
          ...publication,
          order:
            Number.isFinite(
              Number(publication.order),
            ) &&
            Number(publication.order) > 0
              ? Number(publication.order)
              : index + 1,
          images: Array.isArray(
            publication.images,
          )
            ? publication.images
            : [],
          coverImage:
            publication.coverImage || '',
        }
      })
    } catch {
      return defaultPublications
    }
  })

  const defaultPortfolio = [
    {
      id: 1,
      order: 1,
      title: 'Proyecto de muestra',
      category: 'Sitios Web',
      client: 'Cliente de ejemplo',
      link: '',
      shortDescription:
        'Sitio web desarrollado para presentar la propuesta digital del cliente.',
      description:
        'Descripción larga del proyecto realizado por LEGADO MATERO.',
      image: '',
      screenshots: [],
      published: true,
    },
    {
      id: 2,
      order: 2,
      title: 'Proyecto digital',
      category: 'Inteligencia Artificial',
      client: 'Cliente de ejemplo',
      link: '',
      shortDescription:
        'Solución digital desarrollada para resolver una necesidad concreta del proyecto.',
      description:
        'Descripción larga de la solución digital desarrollada para el proyecto.',
      image: '',
      screenshots: [],
      published: true,
    },
    {
      id: 3,
      order: 3,
      title: 'Nuevo proyecto',
      category: 'Sitios Web',
      client: '',
      link: '',
      shortDescription: '',
      description:
        'Descripción larga del proyecto.',
      image: '',
      screenshots: [],
      published: false,
    },
  ]

  const [portfolio, setPortfolio] = useState(() => {
    try {
      const saved = localStorage.getItem(
        'legado-matero-portfolio',
      )

      if (!saved) {
        return defaultPortfolio
      }

      const parsed = JSON.parse(saved)

      if (!Array.isArray(parsed)) {
        return defaultPortfolio
      }

      return parsed.map((project, index) => ({
        ...project,
        order:
          Number.isFinite(
            Number(project.order),
          ) &&
          Number(project.order) > 0
            ? Number(project.order)
            : index + 1,
        image: project.image || '',
        link: project.link || '',
        shortDescription:
          project.shortDescription ||
          '',
        description:
          project.description || '',
        screenshots: Array.isArray(
          project.screenshots,
        )
          ? project.screenshots
          : [],
      }))
    } catch {
      return defaultPortfolio
    }
  })

  const [saving, setSaving] = useState(false)
  const [processingHeroImage, setProcessingHeroImage] = useState('')
  const [processingAboutImage, setProcessingAboutImage] = useState(null)

  useEffect(() => {
    if (checkingSession) {
      return
    }

    const hydrate = async () => {
      try {
        const [
          savedContent,
          savedServices,
          savedAbout,
          savedCategories,
          savedPublications,
          savedPortfolio,
        ] = await Promise.all([
          loadDocument(CMS_KEYS.SITE_CONTENT),
          loadDocument(CMS_KEYS.SERVICES),
          loadDocument(CMS_KEYS.ABOUT_POINTS),
          loadDocument(CMS_KEYS.CATEGORIES),
          loadDocument(CMS_KEYS.PUBLICATIONS),
          loadDocument(CMS_KEYS.PORTFOLIO),
        ])

        if (savedContent) {
          setSiteContent(
            mergeSiteContent(defaultSiteContent, savedContent),
          )
        }

        if (Array.isArray(savedServices)) {
          setServices(savedServices)
        }

        if (Array.isArray(savedAbout)) {
          setAboutPoints(savedAbout)
        }

        if (Array.isArray(savedCategories)) {
          setCategories(savedCategories)
        }

        if (Array.isArray(savedPublications)) {
          setPublications(savedPublications)
        }

        if (Array.isArray(savedPortfolio)) {
          setPortfolio(savedPortfolio)
        }
      } catch (error) {
        console.error(
          'No se pudo cargar el contenido desde Supabase:',
          error,
        )
      }
    }

    hydrate()
  }, [checkingSession])

  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: '⌂' },
    { id: 'legado', label: 'Nuestro legado', icon: '✳' },
    { id: 'productos', label: 'Productos', icon: '◈' },
    { id: 'catalogo', label: 'Catálogo', icon: '▦' },
    { id: 'contacto', label: 'Contacto', icon: '↗' },
  ]

  const sectionTitles = {
    inicio: { eyebrow: 'EDITAR PORTADA', title: 'Inicio', description: 'Mensaje principal, botones y fotografías del Hero.' },
    legado: { eyebrow: 'CONTAR LA HISTORIA', title: 'Nuestro legado', description: 'Editá los capítulos, sus imágenes y el mensaje que une historia y productos.' },
    productos: { eyebrow: 'RECORRIDO COMERCIAL', title: 'Productos', description: 'Textos de la colección, categorías narrativas y productos destacados.' },
    catalogo: { eyebrow: 'ORGANIZAR PRODUCTOS', title: 'Catálogo', description: 'Editá la presentación, las categorías y las fichas desplegables.' },
    contacto: { eyebrow: 'ÚLTIMA SECCIÓN', title: 'Contacto', description: 'Imagen final, mensaje y canales de contacto.' },
  }

  const currentSection = sectionTitles[activeSection] || sectionTitles.inicio

  const updateContent = (
    section,
    field,
    value,
  ) => {
    setSiteContent((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }))
  }

  const saveSiteContent = async () => {
    try {
      setSaving(true)

      // Primero subir todas las nuevas imágenes; recién después escribir documentos.
      // Utilizamos 'home/', la misma carpeta cuya política Storage ya funciona
      // para el Hero. Así no se necesitan nuevas políticas SQL.
      const savedHome = { ...siteContent.home }
      for (const field of ['heroMainImage', 'heroDetailImage']) {
        if (isDataUrl(savedHome[field])) {
          savedHome[field] = await uploadDataUrl(`home/${field}`, savedHome[field])
        }
      }

      const savedContact = { ...siteContent.contact }
      if (isDataUrl(savedContact.bannerImage)) {
        savedContact.bannerImage = await uploadDataUrl(
          'home/contact-banner', savedContact.bannerImage,
        )
      }

      const savedAboutPoints = []
      for (const point of aboutPoints) {
        const nextPoint = { ...point }
        if (isDataUrl(nextPoint.image)) {
          nextPoint.image = await uploadDataUrl(
            `home/legado-${String(point.id).replace(/[^a-zA-Z0-9_-]/g, '') || 'capitulo'}`,
            nextPoint.image,
          )
        }
        savedAboutPoints.push(nextPoint)
      }

      const savedSiteContent = {
        ...siteContent,
        home: savedHome,
        contact: savedContact,
      }

      await saveDocument(CMS_KEYS.SITE_CONTENT, savedSiteContent)
      await saveDocument(CMS_KEYS.SERVICES, services)
      await saveDocument(CMS_KEYS.ABOUT_POINTS, savedAboutPoints)
      setSiteContent(savedSiteContent)
      setAboutPoints(savedAboutPoints)
      alert('Cambios guardados en Supabase.')
    } catch (error) {
      console.error('No se pudo guardar la configuración:', error)
      alert(`No se pudieron guardar los cambios. ${formatCmsError(error)}`)
    } finally {
      setSaving(false)
    }
  }

  const saveCategories = async () => {
    try {
      setSaving(true)

      await saveDocument(CMS_KEYS.CATEGORIES, categories)

      alert('Categorías guardadas en Supabase.')
    } catch (error) {
      console.error(
        'No se pudieron guardar las categorías:',
        error,
      )

      alert(
        `No se pudieron guardar las categorías. ${formatCmsError(error)}`,
      )
    } finally {
      setSaving(false)
    }
  }

  const saveCatalogInventory = async () => {
    try {
      setSaving(true)
      // Persistimos las fotografías antes de escribir los dos documentos existentes.
      const nextPublications = await persistPublicationImages(publications)
      await saveDocument(CMS_KEYS.PUBLICATIONS, nextPublications)
      await saveDocument(CMS_KEYS.CATEGORIES, categories)
      setPublications(nextPublications)
      alert('Categorías y productos guardados en Supabase.')
    } catch (error) {
      console.error('No se pudo guardar el catálogo:', error)
      alert(`No se pudo completar el guardado del catálogo. ${formatCmsError(error)}`)
    } finally {
      setSaving(false)
    }
  }

  const updateService = (
    id,
    field,
    value,
  ) => {
    setServices((current) =>
      current.map((service) =>
        service.id === id
          ? {
              ...service,
              [field]: value,
            }
          : service,
      ),
    )
  }

  const addService = () => {
    setServices((current) => {
      const nextNumber = String(
        current.length + 1,
      ).padStart(2, '0')

      return [
        ...current,
        {
          id: Date.now(),
          number: nextNumber,
          title: 'NUEVO SERVICIO',
          description:
            'Descripción del nuevo servicio.',
        },
      ]
    })
  }

  const deleteService = (id) => {
    setServices((current) => {
      const filtered = current.filter(
        (service) => service.id !== id,
      )

      return filtered.map(
        (service, index) => ({
          ...service,
          number: String(
            index + 1,
          ).padStart(2, '0'),
        }),
      )
    })
  }

  const updateAboutPoint = (
    id,
    field,
    value,
  ) => {
    setAboutPoints((current) =>
      current.map((point) =>
        point.id === id
          ? {
              ...point,
              [field]: value,
            }
          : point,
      ),
    )
  }

  const addAboutPoint = () => {
    setAboutPoints((current) => {
      const nextNumber = String(
        current.length + 1,
      ).padStart(2, '0')

      return [
        ...current,
        {
          id: Date.now(),
          number: nextNumber,
          title: 'NUEVO CAPÍTULO',
          image: '',
          imageAlt: '',
          description:
            'Descripción del nuevo punto.',
        },
      ]
    })
  }

  const deleteAboutPoint = (id) => {
    setAboutPoints((current) => {
      const filtered = current.filter(
        (point) => point.id !== id,
      )

      return filtered.map(
        (point, index) => ({
          ...point,
          number: String(
            index + 1,
          ).padStart(2, '0'),
        }),
      )
    })
  }

  const addCategory = () => {
    setCategories((current) => [
      ...current,
      {
        id: Date.now(),
        name: 'Nueva categoría',
        description:
          'Descripción de la categoría.',
      },
    ])
  }

  const updateCategory = (id, field, value) => {
    // El catálogo original vincula productos con el NOMBRE de la categoría.
    // Renombrarla también debe actualizar esa referencia antes de guardar.
    if (field === 'name') {
      const previousName = categories.find((category) => category.id === id)?.name
      if (previousName !== undefined && previousName !== value) {
        setPublications((current) => current.map((publication) => (
          publication.category === previousName
            ? { ...publication, category: value }
            : publication
        )))
      }
    }
    setCategories((current) => current.map((category) => (
      category.id === id ? { ...category, [field]: value } : category
    )))
  }

  const deleteCategory = (id) => {
    setCategories((current) =>
      current.filter(
        (category) =>
          category.id !== id,
      ),
    )
  }

  const addPublication = () => {
    setPublications((current) => {
      const highestOrder = current.reduce(
        (max, publication) => {
          const order = Number(
            publication.order,
          )

          return Number.isFinite(order) &&
            order > max
            ? order
            : max
        },
        0,
      )

      return [
        ...current,
        {
          id: Date.now(),
          order: highestOrder + 1,
          type: 'Producto',
          title: 'Nueva publicación',
          category:
            categories[0]?.name || '',
          images: [],
          coverImage: '',
          description:
            'Descripción de la publicación.',
          price: '',
          features:
            'Mate de calabaza curado a mano, con virola de alpaca y guarda tallada. Capacidad para 200 ml, ideal para uso diario.',
          commercialInfo:
            'Información comercial.',
          published: false,
        },
      ]
    })
  }

  const updatePublication = (
    id,
    field,
    value,
  ) => {
    setPublications((current) =>
      current.map((publication) =>
        publication.id === id
          ? {
              ...publication,
              [field]:
                field === 'order'
                  ? Math.max(
                      1,
                      Number(value) || 1,
                    )
                  : value,
            }
          : publication,
      ),
    )
  }

  const deletePublication = (id) => {
    setPublications((current) =>
      current.filter(
        (publication) =>
          publication.id !== id,
      ),
    )
  }

  const optimizeImage = (
    file,
    maxWidth = 1400,
    quality = 0.72,
  ) =>
    new Promise((resolve, reject) => {
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ]

      if (!allowedTypes.includes(file.type)) {
        reject(
          new Error(
            'Formato no compatible',
          ),
        )
        return
      }

      const reader = new FileReader()

      reader.onload = () => {
        const image =
          new Image()

        image.onload = () => {
          let width = image.width
          let height = image.height

          if (width > maxWidth) {
            const ratio =
              maxWidth / width

            width = maxWidth
            height = Math.round(
              height * ratio,
            )
          }

          const canvas =
            document.createElement(
              'canvas',
            )

          canvas.width = width
          canvas.height = height

          const context =
            canvas.getContext(
              '2d',
            )

          if (!context) {
            reject(
              new Error(
                'No se pudo procesar la imagen',
              ),
            )
            return
          }

          context.drawImage(
            image,
            0,
            0,
            width,
            height,
          )

          // PNG y WebP conservan su canal alfa. JPEG se mantiene para fotos JPG.
          const outputType = file.type === 'image/png'
            ? 'image/png'
            : file.type === 'image/webp'
              ? 'image/webp'
              : 'image/jpeg'

          const result = canvas.toDataURL(outputType, quality)

          resolve(result)
        }

        image.onerror = () => {
          reject(
            new Error(
              'No se pudo leer la imagen',
            ),
          )
        }

        image.src =
          reader.result
      }

      reader.onerror = () => {
        reject(
          new Error(
            'No se pudo leer el archivo',
          ),
        )
      }

      reader.readAsDataURL(file)
    })

  const handleHomeImage = async (field, event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 12 * 1024 * 1024) {
      alert('La imagen debe pesar menos de 12 MB.')
      event.target.value = ''
      return
    }

    try {
      setProcessingHeroImage(field)
      const image = await optimizeImage(
        file,
        field === 'heroMainImage' ? 1920 : 1200,
        0.84,
      )
      updateContent('home', field, image)
    } catch (error) {
      console.error('Error al preparar la foto de inicio:', error)
      alert('No se pudo procesar la imagen. Usá JPG, PNG o WebP.')
    } finally {
      setProcessingHeroImage('')
      event.target.value = ''
    }
  }

  const handleAboutPointImage = async (id, event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 12 * 1024 * 1024) {
      alert('La imagen debe pesar menos de 12 MB.')
      event.target.value = ''
      return
    }
    try {
      setProcessingAboutImage(id)
      const optimized = await optimizeImage(file, 1400, 0.84)
      updateAboutPoint(id, 'image', optimized)
    } catch (error) {
      console.error('No se pudo preparar la fotografía del capítulo:', error)
      alert('No se pudo procesar la imagen. Usá JPG, PNG o WebP.')
    } finally {
      setProcessingAboutImage(null)
      event.target.value = ''
    }
  }

  const handleContactBanner = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 12 * 1024 * 1024) {
      alert('La imagen debe pesar menos de 12 MB.')
      event.target.value = ''
      return
    }
    try {
      setProcessingHeroImage('contactBannerImage')
      const optimized = await optimizeImage(file, 1800, 0.84)
      updateContent('contact', 'bannerImage', optimized)
    } catch (error) {
      console.error('No se pudo preparar la fotografía de contacto:', error)
      alert('No se pudo procesar la imagen. Usá JPG, PNG o WebP.')
    } finally {
      setProcessingHeroImage('')
      event.target.value = ''
    }
  }

  const handleCategoryImage = async (
    id,
    event,
  ) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      const optimized =
        await optimizeImage(
          file,
          900,
          0.75,
        )

      const url = isDataUrl(optimized)
        ? await uploadDataUrl(
            `categories/${id}`,
            optimized,
          )
        : optimized

      updateCategory(
        id,
        'image',
        url,
      )
    } catch (error) {
      console.error(
        'No se pudo procesar la imagen de la categoría:',
        error,
      )

      alert(
        'No se pudo procesar la imagen. Usá JPG, JPEG, PNG o WebP.',
      )
    }

    event.target.value = ''
  }

  const handlePublicationImages = async (
    id,
    event,
  ) => {
    const files = Array.from(
      event.target.files || [],
    )

    if (!files.length) {
      return
    }

    const validFiles =
      files.filter((file) =>
        [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ].includes(file.type),
      )

    if (!validFiles.length) {
      alert(
        'Formato no compatible. Usá JPG, JPEG, PNG o WebP.',
      )

      event.target.value = ''
      return
    }

    const newImages = []

    for (const file of validFiles) {
      try {
        const optimized =
          await optimizeImage(
            file,
            1400,
            0.72,
          )

        const url = isDataUrl(optimized)
          ? await uploadDataUrl(
              `publications/${id}`,
              optimized,
            )
          : optimized

        newImages.push({
          id: `${Date.now()}-${Math.random()}`,
          url,
        })
      } catch (error) {
        console.error(
          `No se pudo procesar ${file.name}:`,
          error,
        )
      }
    }

    if (!newImages.length) {
      alert(
        'No se pudo procesar ninguna imagen.',
      )

      event.target.value = ''
      return
    }

    setPublications((current) =>
      current.map((publication) => {
        if (publication.id !== id) {
          return publication
        }

        const currentImages =
          Array.isArray(
            publication.images,
          )
            ? publication.images
            : []

        const updatedImages = [
          ...currentImages,
          ...newImages,
        ]

        return {
          ...publication,
          images: updatedImages,
          coverImage:
            publication.coverImage ||
            newImages[0]?.url ||
            '',
        }
      }),
    )

    event.target.value = ''
  }

  const removePublicationImage = (
    publicationId,
    imageId,
  ) => {
    setPublications((current) =>
      current.map((publication) => {
        if (
          publication.id !==
          publicationId
        ) {
          return publication
        }

        const imageToRemove =
          publication.images.find(
            (image) =>
              image.id === imageId,
          )

        const remainingImages =
          publication.images.filter(
            (image) =>
              image.id !== imageId,
          )

        let newCover =
          publication.coverImage

        if (
          imageToRemove &&
          imageToRemove.url ===
            publication.coverImage
        ) {
          newCover =
            remainingImages.length > 0
              ? remainingImages[0].url
              : ''
        }

        return {
          ...publication,
          images: remainingImages,
          coverImage: newCover,
        }
      }),
    )
  }

  const setPublicationCover = (
    publicationId,
    imageUrl,
  ) => {
    updatePublication(
      publicationId,
      'coverImage',
      imageUrl,
    )
  }

  const savePublications = async () => {
    try {
      setSaving(true)

      const publicationsToSave =
        await persistPublicationImages(
          publications,
        )

      setPublications(publicationsToSave)

      await saveDocument(
        CMS_KEYS.PUBLICATIONS,
        publicationsToSave,
      )

      alert(
        'Publicaciones guardadas en Supabase.',
      )
    } catch (error) {
      console.error(
        'Error al guardar publicaciones:',
        error,
      )

      alert(
        `No se pudieron guardar las publicaciones. ${formatCmsError(error)}`,
      )
    } finally {
      setSaving(false)
    }
  }

  const togglePublication = (id) => {
    setPublications((current) =>
      current.map((publication) =>
        publication.id === id
          ? {
              ...publication,
              published:
                !publication.published,
            }
          : publication,
      ),
    )
  }

  const addPortfolioProject = () => {
    setPortfolio((current) => {
      const highestOrder = current.reduce(
        (max, project) => {
          const order = Number(
            project.order,
          )

          return Number.isFinite(order) &&
            order > max
            ? order
            : max
        },
        0,
      )

      return [
        ...current,
        {
          id: Date.now(),
          order: highestOrder + 1,
          title: 'Nuevo proyecto',
          category:
            categories[0]?.name || '',
          client: '',
          link: '',
          shortDescription: '',
          description:
            'Descripción larga del proyecto.',
          image: '',
          screenshots: [],
          published: false,
        },
      ]
    })
  }

  const updatePortfolioProject = (
    id,
    field,
    value,
  ) => {
    setPortfolio((current) =>
      current.map((project) =>
        project.id === id
          ? {
              ...project,
              [field]:
                field === 'order'
                  ? Math.max(
                      1,
                      Number(value) || 1,
                    )
                  : value,
            }
          : project,
      ),
    )
  }

  const deletePortfolioProject = (
    id,
  ) => {
    setPortfolio((current) =>
      current.filter(
        (project) =>
          project.id !== id,
      ),
    )
  }

  const handlePortfolioImages =
    async (id, event) => {
      const files = Array.from(
        event.target.files || [],
      )

      if (!files.length) {
        return
      }

      const validFiles =
        files.filter((file) =>
          [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
          ].includes(file.type),
        )

      if (!validFiles.length) {
        alert(
          'Formato no compatible. Usá JPG, JPEG, PNG o WebP.',
        )

        event.target.value = ''
        return
      }

      const newImages = []

      for (const file of validFiles) {
        try {
          const optimized =
            await optimizeImage(
              file,
              1400,
              0.72,
            )

          const url = isDataUrl(optimized)
            ? await uploadDataUrl(
                `portfolio/${id}`,
                optimized,
              )
            : optimized

          newImages.push(url)
        } catch (error) {
          console.error(
            `No se pudo procesar ${file.name}:`,
            error,
          )
        }
      }

      if (!newImages.length) {
        alert(
          'No se pudo procesar ninguna imagen.',
        )

        event.target.value = ''
        return
      }

      setPortfolio((current) =>
        current.map((project) => {
          if (project.id !== id) {
            return project
          }

          const currentScreenshots =
            Array.isArray(
              project.screenshots,
            )
              ? project.screenshots
              : []

          if (!project.image) {
            return {
              ...project,
              image:
                newImages[0] || '',
              screenshots: [
                ...currentScreenshots,
                ...newImages.slice(1),
              ],
            }
          }

          return {
            ...project,
            screenshots: [
              ...currentScreenshots,
              ...newImages,
            ],
          }
        }),
      )

      event.target.value = ''
    }

  const setPortfolioCover = (
    projectId,
    imageUrl,
  ) => {
    setPortfolio((current) =>
      current.map((project) => {
        if (
          project.id !== projectId
        ) {
          return project
        }

        if (
          project.image ===
          imageUrl
        ) {
          return project
        }

        const screenshots =
          Array.isArray(
            project.screenshots,
          )
            ? project.screenshots
            : []

        const newScreenshots =
          screenshots.filter(
            (image) =>
              image !== imageUrl,
          )

        if (
          project.image &&
          project.image !==
            imageUrl
        ) {
          newScreenshots.unshift(
            project.image,
          )
        }

        return {
          ...project,
          image: imageUrl,
          screenshots:
            newScreenshots,
        }
      }),
    )
  }

  const removePortfolioImage = (
    projectId,
    imageUrl,
  ) => {
    setPortfolio((current) =>
      current.map((project) => {
        if (
          project.id !==
          projectId
        ) {
          return project
        }

        const screenshots =
          Array.isArray(
            project.screenshots,
          )
            ? project.screenshots
            : []

        if (
          project.image ===
          imageUrl
        ) {
          if (
            screenshots.length > 0
          ) {
            return {
              ...project,
              image:
                screenshots[0],
              screenshots:
                screenshots.slice(1),
            }
          }

          return {
            ...project,
            image: '',
            screenshots: [],
          }
        }

        return {
          ...project,
          screenshots:
            screenshots.filter(
              (image) =>
                image !== imageUrl,
            ),
        }
      }),
    )
  }

  const togglePortfolioProject = (
    id,
  ) => {
    setPortfolio((current) =>
      current.map((project) =>
        project.id === id
          ? {
              ...project,
              published:
                !project.published,
            }
          : project,
      ),
    )
  }

  const savePortfolio = async () => {
    try {
      setSaving(true)

      const portfolioToSave =
        await persistPortfolioImages(
          portfolio,
        )

      setPortfolio(portfolioToSave)

      await saveDocument(
        CMS_KEYS.PORTFOLIO,
        portfolioToSave,
      )

      alert(
        'Portfolio guardado en Supabase.',
      )
    } catch (error) {
      console.error(
        'Error al guardar portfolio:',
        error,
      )

      alert(
        `No se pudo guardar el portfolio. ${formatCmsError(error)}`,
      )
    } finally {
      setSaving(false)
    }
  }

  const eligibleFeaturedProducts = publications
    .filter((publication) => publication.published && (
      publication.coverImage || publication.images?.[0]?.url || publication.image
    ))
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))

  // Al abrir un proyecto sin destacados guardados, los tres primeros
  // siguen mostrándose hasta que el cliente elija su selección.
  const featuredProductIds = Array.isArray(siteContent.services.featuredProductIds)
    ? siteContent.services.featuredProductIds.map(String)
    : eligibleFeaturedProducts.slice(0, 3).map((item) => String(item.id))

  const changeFeaturedProduct = (slot, selectedId) => {
    const next = [0, 1, 2].map((index) => featuredProductIds[index] || '')
    next[slot] = selectedId
    if (selectedId) {
      next.forEach((id, index) => {
        if (index !== slot && id === selectedId) next[index] = ''
      })
    }
    updateContent('services', 'featuredProductIds', next.filter(Boolean))
  }

  const renderField = (
    label,
    value,
    onChange,
    textarea = false,
  ) => (
    <label className="admin-field">
      <span>{label}</span>

      {textarea ? (
        <textarea
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
        />
      ) : (
        <input
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
        />
      )}
    </label>
  )

  // Único editor de ficha reutilizado en todas las categorías.
  // Conserva imágenes múltiples, portada, orden, precio y estado existentes.
  const renderProductAccordion = (publication, index) => (
                  <details className="admin-accordion-product" key={publication.id}>
                    <summary className="admin-product-summary">
                      <span className="admin-product-thumb">
                        {publication.coverImage ? (
                          <img src={publication.coverImage} alt="" loading="lazy" />
                        ) : (<span aria-hidden="true">✳</span>)}
                      </span>
                      <span className="admin-product-main">
                        <strong>{publication.title || 'Producto sin título'}</strong>
                        <small>{publication.type || 'Producto'} · {publication.category || 'Sin categoría'}</small>
                      </span>
                      <span className={`admin-product-state ${publication.published ? 'is-public' : ''}`}>
                        {publication.published ? 'Publicado' : 'Oculto'}
                      </span>
                      <span className="admin-product-price">{publication.price || 'Sin precio'}</span>
                      <span className="admin-collapse-indicator" aria-hidden="true">⌄</span>
                    </summary>
                    <div className="admin-accordion-editor">
                        <div className="admin-item-fields">

                          <div className="admin-form-grid">

                            {renderField(
                              'Título',
                              publication.title,
                              (value) =>
                                updatePublication(
                                  publication.id,
                                  'title',
                                  value,
                                ),
                            )}

                            <label className="admin-field">
                              <span>
                                Orden
                              </span>

                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={
                                  publication.order
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updatePublication(
                                    publication.id,
                                    'order',
                                    event
                                      .target
                                      .value,
                                  )
                                }
                              />
                            </label>

                            <label className="admin-field">
                              <span>
                                Tipo
                              </span>

                              <select
                                value={
                                  publication.type
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updatePublication(
                                    publication.id,
                                    'type',
                                    event
                                      .target
                                      .value,
                                  )
                                }
                              >
                                <option value="Producto">
                                  Producto
                                </option>

                                <option value="Servicio">
                                  Servicio
                                </option>
                              </select>
                            </label>

                            <label className="admin-field">
                              <span>
                                Categoría
                              </span>

                              <select
                                value={
                                  publication.category
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updatePublication(
                                    publication.id,
                                    'category',
                                    event
                                      .target
                                      .value,
                                  )
                                }
                              >
                                <option value="">
                                  Seleccionar categoría
                                </option>

                                {categories.map(
                                  (
                                    category,
                                  ) => (
                                    <option
                                      key={
                                        category.id
                                      }
                                      value={
                                        category.name
                                      }
                                    >
                                      {
                                        category.name
                                      }
                                    </option>
                                  ),
                                )}
                              </select>
                            </label>

                            {renderField(
                              'Precio',
                              publication.price,
                              (value) =>
                                updatePublication(
                                  publication.id,
                                  'price',
                                  value,
                                ),
                            )}

                            <div className="admin-field-full">

                              <label className="admin-field">
                                <span>
                                  Imágenes
                                </span>

                                <input
                                  type="file"
                                  accept="image/jpeg,image/jpg,image/png,image/webp"
                                  multiple
                                  onChange={(
                                    event,
                                  ) =>
                                    handlePublicationImages(
                                      publication.id,
                                      event,
                                    )
                                  }
                                />
                              </label>

                              <p
                                style={{
                                  marginTop:
                                    '8px',
                                  fontSize:
                                    '13px',
                                }}
                              >
                                JPG, JPEG, PNG o WebP.
                                Podés seleccionar
                                varias imágenes
                                desde tu PC.
                                Las imágenes se
                                optimizan
                                automáticamente.
                              </p>

                              {publication.images &&
                                publication.images
                                  .length >
                                  0 && (
                                  <div
                                    style={{
                                      display:
                                        'grid',
                                      gridTemplateColumns:
                                        'repeat(auto-fit, minmax(140px, 1fr))',
                                      gap:
                                        '14px',
                                      marginTop:
                                        '18px',
                                      width:
                                        '100%',
                                    }}
                                  >

                                    {publication.images.map(
                                      (
                                        image,
                                      ) => {
                                        const isCover =
                                          image.url ===
                                          publication.coverImage

                                        return (
                                          <div
                                            key={
                                              image.id
                                            }
                                            style={{
                                              position:
                                                'relative',
                                              width:
                                                '100%',
                                              minWidth:
                                                0,
                                              border:
                                                isCover
                                                  ? '2px solid #7EC8F3'
                                                  : '1px solid rgba(245,245,242,0.12)',
                                              padding:
                                                '4px',
                                              background:
                                                '#0D0D0D',
                                            }}
                                          >

                                            <button
                                              type="button"
                                              onClick={() =>
                                                setPublicationCover(
                                                  publication.id,
                                                  image.url,
                                                )
                                              }
                                              style={{
                                                display:
                                                  'block',
                                                width:
                                                  '100%',
                                                height:
                                                  '130px',
                                                padding:
                                                  0,
                                                border:
                                                  'none',
                                                cursor:
                                                  'pointer',
                                                background:
                                                  '#0D0D0D',
                                              }}
                                            >
                                              <img
                                                src={
                                                  image.url
                                                }
                                                alt={
                                                  publication.title
                                                }
                                                style={{
                                                  width:
                                                    '100%',
                                                  height:
                                                    '100%',
                                                  objectFit:
                                                    'cover',
                                                  display:
                                                    'block',
                                                }}
                                              />
                                            </button>

                                            <div
                                              style={{
                                                display:
                                                  'flex',
                                                alignItems:
                                                  'center',
                                                justifyContent:
                                                  'space-between',
                                                flexWrap:
                                                  'wrap',
                                                gap:
                                                  '8px',
                                                marginTop:
                                                  '6px',
                                              }}
                                            >

                                              <small
                                                style={{
                                                  color:
                                                    isCover
                                                      ? '#7EC8F3'
                                                      : '#A7B6C2',
                                                }}
                                              >
                                                {isCover
                                                  ? '★ PORTADA'
                                                  : 'Elegir portada'}
                                              </small>

                                              <button
                                                type="button"
                                                onClick={() =>
                                                  removePublicationImage(
                                                    publication.id,
                                                    image.id,
                                                  )
                                                }
                                                style={{
                                                  border:
                                                    'none',
                                                  cursor:
                                                    'pointer',
                                                  padding:
                                                    '5px 9px',
                                                  background:
                                                    'rgba(11,13,16,0.9)',
                                                  color:
                                                    '#FFFFFF',
                                                  fontSize:
                                                    '18px',
                                                }}
                                              >
                                                ×
                                              </button>

                                            </div>

                                          </div>
                                        )
                                      },
                                    )}

                                  </div>
                                )}

                              {publication.images &&
                                publication.images
                                  .length >
                                  0 && (
                                  <p
                                    style={{
                                      marginTop:
                                        '12px',
                                      fontSize:
                                        '12px',
                                    }}
                                  >
                                    Hacé clic sobre
                                    una imagen para
                                    convertirla en
                                    portada.
                                  </p>
                                )}

                            </div>

                            <div className="admin-field-full">
                              {renderField(
                                'Descripción',
                                publication.description,
                                (value) =>
                                  updatePublication(
                                    publication.id,
                                    'description',
                                    value,
                                  ),
                                true,
                              )}
                            </div>

                            <div className="admin-field-full">
                              {renderField(
                                'Características',
                                publication.features,
                                (value) =>
                                  updatePublication(
                                    publication.id,
                                    'features',
                                    value,
                                  ),
                                true,
                              )}
                            </div>

                            <div className="admin-field-full">
                              {renderField(
                                'Información comercial',
                                publication.commercialInfo,
                                (value) =>
                                  updatePublication(
                                    publication.id,
                                    'commercialInfo',
                                    value,
                                  ),
                                true,
                              )}
                            </div>

                          </div>

                          <div
                            style={{
                              display:
                                'flex',
                              alignItems:
                                'center',
                              justifyContent:
                                'space-between',
                              flexWrap:
                                'wrap',
                              gap:
                                '12px',
                              marginTop:
                                '20px',
                              paddingTop:
                                '20px',
                              borderTop:
                                '1px solid rgba(245,245,242,0.08)',
                            }}
                          >

                            <button
                              type="button"
                              className="admin-add-button"
                              onClick={() =>
                                togglePublication(
                                  publication.id,
                                )
                              }
                            >
                              {publication.published
                                ? '● Publicado'
                                : '○ Oculto'}
                            </button>

                            <button
                              type="button"
                              className="admin-delete-button"
                              onClick={() =>
                                deletePublication(
                                  publication.id,
                                )
                              }
                            >
                              Eliminar
                            </button>

                          </div>

                        </div>
                    </div>
                  </details>
  )

  if (checkingSession) {
    return null
  }

  return (
    <main className="admin-layout admin-workspace">
      <section className="admin-main">
        <header className="admin-workspace-header">
          <div className="admin-brand">
            <div className="admin-brand-mark" aria-hidden="true"><span></span><span></span></div>
            <div><strong>LEGADO MATERO</strong><small>ESTUDIO DE CONTENIDO</small></div>
          </div>
          <div className="admin-workspace-actions">
            <a href="/" target="_blank" rel="noopener noreferrer">↗ Ver sitio</a>
            <button type="button" onClick={async () => { await supabase.auth.signOut(); window.location.href='/admin' }}>
              Cerrar sesión
            </button>
          </div>
        </header>
        <nav className="admin-tabs" aria-label="Secciones editables del sitio">
          {menuItems.map((item) => (
            <button type="button" key={item.id}
              className={`admin-tab ${activeSection === item.id ? 'is-active' : ''}`}
              aria-current={activeSection === item.id ? 'page' : undefined}
              onClick={() => {
                setActiveSection(item.id)
                window.scrollTo({ top: 0, behavior: 'auto' })
              }}>
              <span className="admin-tab-icon" aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="admin-content">
          <header className="admin-page-header">
            <div>
              <span className="admin-eyebrow">{currentSection.eyebrow}</span>
              <h1>{currentSection.title}</h1>
              <p>{currentSection.description}</p>
            </div>
            <span className="admin-workspace-indicator">EDITOR DEL SITIO <span aria-hidden="true">●</span></span>
          </header>

          {activeSection === 'inicio' && (
            <div className="admin-settings">
              <section className="admin-editor-card">

                <div className="admin-editor-header">

                  <div>
                    <span>
                      PORTADA DEL SITIO
                    </span>

                    <h2>
                      Página principal
                    </h2>
                  </div>

                  

                </div>

                <div className="admin-form-grid">

                  {renderField(
                    'Etiqueta superior',
                    siteContent.home.eyebrow,
                    (value) =>
                      updateContent(
                        'home',
                        'eyebrow',
                        value,
                      ),
                  )}

                  {renderField(
                    'Título principal',
                    siteContent.home.title,
                    (value) =>
                      updateContent(
                        'home',
                        'title',
                        value,
                      ),
                  )}

                  <div className="admin-field-full">
                    {renderField(
                      'Descripción',
                      siteContent.home
                        .description,
                      (value) =>
                        updateContent(
                          'home',
                          'description',
                          value,
                        ),
                      true,
                    )}
                  </div>

                  {renderField(
                    'Texto del botón',
                    siteContent.home.button,
                    (value) =>
                      updateContent(
                        'home',
                        'button',
                        value,
                      ),
                  )}

                  {renderField(
                    'Botón secundario (WhatsApp)',
                    siteContent.home.whatsappButton || 'Consultar por WhatsApp',
                    (value) => updateContent('home', 'whatsappButton', value),
                  )}

                  <div className="admin-field-full admin-home-images">
                    <div className="admin-home-images-heading">
                      <strong>Fotografías del inicio</strong>
                      <p>Seleccioná cada imagen por separado. El logo de Legado Matero no se modifica.</p>
                    </div>
                    <div className="admin-home-images-grid">
                      {[
                        {
                          field: 'heroMainImage',
                          label: 'Imagen principal',
                          hint: 'Fotografía grande que aparece a la derecha del Hero.',
                          fallback: defaultHeroMain,
                        },
                        {
                          field: 'heroDetailImage',
                          label: 'Imagen de detalle',
                          hint: 'Fotografía pequeña superpuesta a la principal.',
                          fallback: defaultHeroDetail,
                        },
                      ].map(({ field, label, hint, fallback }) => (
                        <div className="admin-home-image-card" key={field}>
                          <div className={`admin-home-image-preview ${field === 'heroMainImage' ? 'is-main' : 'is-detail'}`}>
                            <img
                              src={siteContent.home[field] || fallback}
                              alt={`Vista previa: ${label.toLowerCase()}`}
                            />
                          </div>
                          <strong>{label}</strong>
                          <p>{hint}</p>
                          <div className="admin-home-image-actions">
                            <label className="admin-home-image-upload">
                              {processingHeroImage === field ? 'Procesando…' : 'Elegir fotografía'}
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                disabled={Boolean(processingHeroImage) || saving}
                                onChange={(event) => handleHomeImage(field, event)}
                                aria-label={`Elegir ${label.toLowerCase()}`}
                              />
                            </label>
                            <button
                              type="button"
                              className="admin-home-image-reset"
                              disabled={Boolean(processingHeroImage) || saving}
                              onClick={() => updateContent('home', field, '')}
                            >
                              Usar original
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="admin-home-images-note" aria-live="polite">
                      {processingHeroImage
                        ? 'Preparando imagen…'
                        : 'Las fotografías seleccionadas se publican al pulsar «Guardar cambios».'}
                    </p>
                  </div>

                </div>

              </section>
              <div className="admin-save-bar">
                <span>Guardá para publicar los cambios de esta sección en Supabase.</span>
                <button type="button" className="admin-save-button"
                  onClick={saveSiteContent}
                  disabled={saving || Boolean(processingHeroImage) || Boolean(processingAboutImage)}>
                  {saving ? 'Guardando…' : 'Guardar cambios'} <span aria-hidden="true">↗</span>
                </button>
              </div>
            </div>
          )}
          {activeSection === 'legado' && (
            <div className="admin-settings">
              <section className="admin-editor-card">

                <div className="admin-editor-header">

                  <div>
                    <span>
                      RECORRIDO E HISTORIA
                    </span>

                    <h2>
                      Historia y capítulos del recorrido
                    </h2>
                  </div>

                  <button
                    className="admin-add-button"
                    onClick={
                      addAboutPoint
                    }
                  >
                    + Agregar capítulo
                  </button>

                </div>

                <div className="admin-form-grid">

                  {renderField(
                    'Etiqueta',
                    cleanSectionLabel(siteContent.about.eyebrow),
                    (value) =>
                      updateContent(
                        'about',
                        'eyebrow',
                        value,
                      ),
                  )}

                  {renderField(
                    'Título',
                    siteContent.about
                      .title,
                    (value) =>
                      updateContent(
                        'about',
                        'title',
                        value,
                      ),
                  )}

                  <div className="admin-field-full">
                    {renderField(
                      'Texto principal',
                      siteContent.about
                        .lead,
                      (value) =>
                        updateContent(
                          'about',
                          'lead',
                          value,
                        ),
                      true,
                    )}
                  </div>



                </div>

                <div className="admin-items-list">

                  {aboutPoints.map(
                    (point) => (
                      <article
                        className="admin-item-card"
                        key={point.id}
                      >

                        <div className="admin-item-number">
                          {
                            point.number
                          }
                        </div>

                        <div className="admin-item-fields">

                          {renderField(
                            'Título',
                            point.title,
                            (value) =>
                              updateAboutPoint(
                                point.id,
                                'title',
                                value,
                              ),
                          )}

                          {renderField(
                            'Descripción',
                            point.description,
                            (value) =>
                              updateAboutPoint(
                                point.id,
                                'description',
                                value,
                              ),
                            true,
                          )}
                          <div className="admin-chapter-media">
                            <strong>Fotografía del capítulo</strong>
                            <div className="admin-chapter-preview">
                              {point.image ? (
                                <img src={point.image} alt={`Vista previa de ${point.title}`} />
                              ) : (
                                <span>Sin fotografía personalizada: se mostrará la imagen original.</span>
                              )}
                            </div>
                            <div className="admin-home-image-actions">
                              <label className="admin-home-image-upload">
                                {processingAboutImage === point.id ? 'Procesando…' : 'Elegir fotografía'}
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  disabled={saving || Boolean(processingAboutImage) || Boolean(processingHeroImage)}
                                  onChange={(event) => handleAboutPointImage(point.id, event)}
                                />
                              </label>
                              <button
                                type="button"
                                className="admin-home-image-reset"
                                disabled={saving || Boolean(processingAboutImage)}
                                onClick={() => updateAboutPoint(point.id, 'image', '')}
                              >Usar original</button>
                            </div>
                            {renderField(
                              'Descripción accesible de la fotografía (opcional)',
                              point.imageAlt || '',
                              (value) => updateAboutPoint(point.id, 'imageAlt', value),
                            )}
                          </div>

                        </div>

                        <button
                          className="admin-delete-button"
                          onClick={() =>
                            deleteAboutPoint(
                              point.id,
                            )
                          }
                        >
                          Eliminar
                        </button>

                      </article>
                    ),
                  )}

                </div>

              </section>
              <section className="admin-editor-card admin-bridge-card">
                <div className="admin-editor-header">
                  <div>
                    <span>MENSAJE INTERMEDIO</span>
                    <h2>Entre la historia y los productos</h2>
                    <p className="admin-card-hint">Este texto aparece después de los capítulos y antes de «Mates y accesorios con historia».</p>
                  </div>
                </div>
                <div className="admin-form-grid">
                  <div className="admin-field-full">
                    {renderField(
                      'Descripción',
                      siteContent.about
                        .description,
                      (value) =>
                        updateContent(
                          'about',
                          'description',
                          value,
                        ),
                      true,
                    )}
                  </div>
                </div>
              </section>
              <div className="admin-save-bar">
                <span>Guardá para publicar los cambios de esta sección en Supabase.</span>
                <button type="button" className="admin-save-button"
                  onClick={saveSiteContent}
                  disabled={saving || Boolean(processingHeroImage) || Boolean(processingAboutImage)}>
                  {saving ? 'Guardando…' : 'Guardar cambios'} <span aria-hidden="true">↗</span>
                </button>
              </div>
            </div>
          )}
          {activeSection === 'productos' && (
            <div className="admin-settings">
              <section className="admin-editor-card">

                <div className="admin-editor-header">

                  <div>
                    <span>
                      SECCIÓN PRODUCTOS
                    </span>

                    <h2>
                      Cierre comercial del recorrido
                    </h2>
                  </div>

                  <button
                    className="admin-add-button"
                    onClick={addService}
                  >
                    + Agregar servicio
                  </button>

                </div>

                <div className="admin-form-grid">

                  {renderField(
                    'Etiqueta',
                    cleanSectionLabel(siteContent.services.eyebrow),
                    (value) =>
                      updateContent(
                        'services',
                        'eyebrow',
                        value,
                      ),
                  )}

                  {renderField(
                    'Título',
                    siteContent.services
                      .title,
                    (value) =>
                      updateContent(
                        'services',
                        'title',
                        value,
                      ),
                  )}

                  <div className="admin-field-full">
                    {renderField(
                      'Descripción general',
                      siteContent.services
                        .description,
                      (value) =>
                        updateContent(
                          'services',
                          'description',
                          value,
                        ),
                      true,
                    )}
                  </div>

                </div>

                <div className="admin-items-list">

                  {services.map(
                    (service) => (
                      <article
                        className="admin-item-card"
                        key={service.id}
                      >

                        <div className="admin-item-number">
                          {
                            service.number
                          }
                        </div>

                        <div className="admin-item-fields">

                          {renderField(
                            'Título',
                            service.title,
                            (value) =>
                              updateService(
                                service.id,
                                'title',
                                value,
                              ),
                          )}

                          {renderField(
                            'Descripción',
                            service.description,
                            (value) =>
                              updateService(
                                service.id,
                                'description',
                                value,
                              ),
                            true,
                          )}

                        </div>

                        <button
                          className="admin-delete-button"
                          onClick={() =>
                            deleteService(
                              service.id,
                            )
                          }
                        >
                          Eliminar
                        </button>

                      </article>
                    ),
                  )}

                </div>

                <div className="admin-featured-selection">
                  <div className="admin-home-images-heading">
                    <strong>Productos destacados del recorrido</strong>
                    <p>Elegí hasta tres publicaciones del catálogo para la galería «Mates y accesorios con historia». Antes se mostraban automáticamente las primeras tres con foto.</p>
                  </div>
                  <div className="admin-featured-grid">
                    {[0, 1, 2].map((slot) => (
                      <label key={slot} className="admin-field">
                        <span>Destacado {slot + 1}</span>
                        <select
                          value={featuredProductIds[slot] || ''}
                          onChange={(event) => changeFeaturedProduct(slot, event.target.value)}
                          disabled={saving}
                        >
                          <option value="">Sin producto</option>
                          {eligibleFeaturedProducts.map((item) => (
                            <option key={item.id} value={String(item.id)}>
                              {item.title}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                  <p className="admin-home-images-note">Solo aparecen productos publicados con fotografía. Guardá los cambios para aplicar la selección.</p>
                </div>

              </section>
              <div className="admin-save-bar">
                <span>Guardá para publicar los cambios de esta sección en Supabase.</span>
                <button type="button" className="admin-save-button"
                  onClick={saveSiteContent}
                  disabled={saving || Boolean(processingHeroImage) || Boolean(processingAboutImage)}>
                  {saving ? 'Guardando…' : 'Guardar cambios'} <span aria-hidden="true">↗</span>
                </button>
              </div>
            </div>
          )}
          {activeSection === 'catalogo' && (
            <div className="admin-settings">
              <section className="admin-editor-card">

                <div className="admin-editor-header">

                  <div>
                    <span>
                      PRESENTACIÓN DEL CATÁLOGO
                    </span>

                    <h2>
                      Sección de catálogo
                    </h2>
                  </div>

                  

                </div>

                <div className="admin-form-grid">

                  {renderField(
                    'Etiqueta',
                    cleanSectionLabel(siteContent.catalog.eyebrow),
                    (value) =>
                      updateContent(
                        'catalog',
                        'eyebrow',
                        value,
                      ),
                  )}

                  {renderField(
                    'Título',
                    siteContent.catalog
                      .title,
                    (value) =>
                      updateContent(
                        'catalog',
                        'title',
                        value,
                      ),
                  )}

                  <div className="admin-field-full">
                    {renderField(
                      'Descripción',
                      siteContent.catalog
                        .description,
                      (value) =>
                        updateContent(
                          'catalog',
                          'description',
                          value,
                        ),
                      true,
                    )}
                  </div>

                </div>

              </section>
              <div className="admin-save-bar">
                <span>Guardá para publicar los cambios de esta sección en Supabase.</span>
                <button type="button" className="admin-save-button"
                  onClick={saveSiteContent}
                  disabled={saving || Boolean(processingHeroImage) || Boolean(processingAboutImage)}>
                  {saving ? 'Guardando…' : 'Guardar cambios'} <span aria-hidden="true">↗</span>
                </button>
              </div>
              <section className="admin-editor-card admin-catalog-manager">
                <div className="admin-editor-header">
                  <div>
                    <span>GESTIÓN DEL CATÁLOGO</span>
                    <h2>Categorías y productos</h2>
                    <p className="admin-card-hint">Abrí una categoría y después el producto que quieras editar. Los demás permanecen cerrados.</p>
                  </div>
                  <div className="admin-header-actions">
                    <button type="button" className="admin-add-button" onClick={addCategory}>+ Categoría</button>
                    <button type="button" className="admin-add-button" onClick={addPublication}>+ Producto</button>
                  </div>
                </div>

                <div className="admin-accordion-list">
                  {categories.map((category) => {
                    const categoryProducts = publications.filter((publication) => publication.category === category.name)
                    return (
                    <details className="admin-accordion-category" key={category.id}>
                      <summary className="admin-category-summary">
                        <span className="admin-category-thumbnail">
                          {category.image ? <img src={category.image} alt="" loading="lazy" /> : <span aria-hidden="true">▦</span>}
                        </span>
                        <strong>{category.name || 'Categoría sin nombre'}</strong>
                        <small>{categoryProducts.length} {categoryProducts.length === 1 ? 'producto' : 'productos'}</small>
                        <span className="admin-collapse-indicator" aria-hidden="true">⌄</span>
                      </summary>
                      <div className="admin-category-editor">
                        <h3>Editar categoría</h3>
                      <div className="admin-form-grid admin-category-form">
                        {renderField('Nombre de categoría', category.name,
                          (value) => updateCategory(category.id, 'name', value))}
                        {renderField('Descripción', category.description,
                          (value) => updateCategory(category.id, 'description', value), true)}
                        <div className="admin-field-full admin-category-photo">
                          <label className="admin-field">
                            <span>Imagen de categoría</span>
                            <input type="file" accept="image/jpeg,image/png,image/webp"
                              onChange={(event) => handleCategoryImage(category.id,event)} disabled={saving} />
                          </label>
                          {category.image && <img className="admin-category-photo-preview" src={category.image} alt={`Vista previa de ${category.name}`} />}
                          {category.image && <button type="button" className="admin-delete-button"
                            onClick={() => updateCategory(category.id, 'image', '')}>Quitar imagen</button>}
                        </div>
                        <button type="button" className="admin-delete-button admin-danger-end"
                          onClick={() => {if(window.confirm('¿Eliminar esta categoría? Los productos no se borrarán, pero pueden quedar sin categoría.')) deleteCategory(category.id)}}>
                          Eliminar categoría
                        </button>
                      </div>
                        <div className="admin-nested-product-header">
                          <h3>Productos de esta categoría</h3>
                          <span>{categoryProducts.length} en total</span>
                        </div>
                        <div className="admin-product-list">
                          {categoryProducts.map((publication, index) => (
renderProductAccordion(publication, index)
                          ))}
                          {categoryProducts.length === 0 && <p className="admin-list-empty">Todavía no hay productos en esta categoría. Usá «+ Producto» y elegí su categoría.</p>}
                        </div>
                      </div>
                    </details>
                    )
                  })}
                  {publications.some((publication) => !categories.some((category) => category.name === publication.category)) && (
                    <details className="admin-accordion-category">
                      <summary className="admin-category-summary">
                        <span className="admin-category-thumbnail"><span aria-hidden="true">?</span></span>
                        <strong>Sin categoría asignada</strong>
                        <small>Revisar asignaciones</small>
                        <span className="admin-collapse-indicator" aria-hidden="true">⌄</span>
                      </summary>
                      <div className="admin-category-editor">
                        <p className="admin-card-hint">Estos productos pertenecen a una categoría inexistente o todavía no tienen una. Abrí uno y elegí su nueva categoría.</p>
                        <div className="admin-product-list">
                          {publications.filter((publication) => !categories.some((category) => category.name === publication.category)).map((publication, index) => (
renderProductAccordion(publication, index)
                          ))}
                        </div>
                      </div>
                    </details>
                  )}
                  {!categories.length && !publications.length && <p className="admin-list-empty">Empezá agregando tu primera categoría.</p>}
                </div>
              </section>
              <div className="admin-save-bar admin-save-inventory">
                <span>Guarda las categorías y todos los productos, incluidas fotos y visibilidad.</span>
                <button type="button" className="admin-save-button"
                  onClick={saveCatalogInventory} disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar categorías y productos'}
                  <span aria-hidden="true">↗</span>
                </button>
              </div>
            </div>
          )}
          {activeSection === 'contacto' && (
            <div className="admin-settings">
              <section className="admin-editor-card">

                <div className="admin-editor-header">

                  <div>
                    <span>
                      CIERRE DEL SITIO
                    </span>

                    <h2>
                      Información de contacto
                    </h2>
                  </div>

                </div>

                <div className="admin-form-grid">

                  {renderField(
                    'Etiqueta',
                    cleanSectionLabel(siteContent.contact.eyebrow),
                    (value) =>
                      updateContent(
                        'contact',
                        'eyebrow',
                        value,
                      ),
                  )}

                  {renderField(
                    'Título',
                    siteContent.contact
                      .title,
                    (value) =>
                      updateContent(
                        'contact',
                        'title',
                        value,
                      ),
                  )}

                  <div className="admin-field-full">
                    {renderField(
                      'Descripción',
                      siteContent.contact
                        .description,
                      (value) =>
                        updateContent(
                          'contact',
                          'description',
                          value,
                        ),
                      true,
                    )}
                  </div>

                  <div className="admin-field-full admin-contact-media">
                    <div className="admin-home-images-heading">
                      <strong>Imagen de la sección Contacto</strong>
                      <p>Personalizá la fotografía del cierre de la página. No cambia las imágenes del Hero ni de los capítulos.</p>
                    </div>
                    <div className="admin-home-image-preview admin-contact-preview">
                      <img
                        src={siteContent.contact.bannerImage || defaultHeroMain}
                        alt="Vista previa de la imagen de contacto"
                      />
                    </div>
                    <div className="admin-home-image-actions">
                      <label className="admin-home-image-upload">
                        {processingHeroImage === 'contactBannerImage' ? 'Procesando…' : 'Elegir fotografía'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          disabled={saving || Boolean(processingHeroImage) || Boolean(processingAboutImage)}
                          onChange={handleContactBanner}
                        />
                      </label>
                      <button
                        type="button"
                        className="admin-home-image-reset"
                        disabled={saving || Boolean(processingHeroImage)}
                        onClick={() => updateContent('contact', 'bannerImage', '')}
                      >Usar original</button>
                    </div>
                  </div>

                  {renderField(
                    'WhatsApp',
                    siteContent.contact
                      .whatsapp,
                    (value) =>
                      updateContent(
                        'contact',
                        'whatsapp',
                        value,
                      ),
                  )}

                  {renderField(
                    'LinkedIn',
                    siteContent.contact
                      .linkedin,
                    (value) =>
                      updateContent(
                        'contact',
                        'linkedin',
                        value,
                      ),
                  )}

                  {renderField(
                    'Instagram (usuario o link)',
                    siteContent.contact
                      .instagram || '',
                    (value) =>
                      updateContent(
                        'contact',
                        'instagram',
                        value,
                      ),
                  )}

                  {renderField(
                    'Fiverr (usuario o link)',
                    siteContent.contact
                      .fiverr || '',
                    (value) =>
                      updateContent(
                        'contact',
                        'fiverr',
                        value,
                      ),
                  )}

                </div>

              </section>
              <div className="admin-save-bar">
                <span>Guardá para publicar los cambios de esta sección en Supabase.</span>
                <button type="button" className="admin-save-button"
                  onClick={saveSiteContent}
                  disabled={saving || Boolean(processingHeroImage) || Boolean(processingAboutImage)}>
                  {saving ? 'Guardando…' : 'Guardar cambios'} <span aria-hidden="true">↗</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default Admin

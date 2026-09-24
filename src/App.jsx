import { useEffect, useRef, useState } from 'react'
import './App.css'
import banner from './assets/banner-productos.jpg'
import contactBanner from './assets/banner-contacto.jpg'
import logo from './assets/logo.png'
import heroImage from './assets/home-hero.jpg'
import Login from './pages/Login.jsx'
import Admin from './pages/Admin.jsx'
import {
  CMS_KEYS,
  loadDocument,
  mergeSiteContent,
  readLocalFallback,
} from './cms'

const DEFAULT_EMAIL = 'contacto@legadomatero.com.ar'

const DEFAULT_SITE_CONTENT = {
  home: {
    eyebrow: 'TRADICIÓN · FAMILIA · LEGADO',
    title: 'No vendemos mates. Compartimos un legado.',
    description:
      'Cada mate tiene una historia. Nosotros queremos ayudarte a seguir compartiéndola.',
    button: 'Conocé nuestros mates',
  },
  services: {
    eyebrow: '01 / PRODUCTOS',
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
    email: DEFAULT_EMAIL,
  },
}

const DEFAULT_SERVICES = [
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

const DEFAULT_ABOUT_POINTS = [
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

function renderHighlightedTitle(title) {
  const text = String(title || '').trim()
  const words = text.split(/\s+/).filter(Boolean)

  if (words.length < 3) {
    return text
  }

  const lead = words.slice(0, -2).join(' ')
  const highlight = words.slice(-2).join(' ')

  return (
    <>
      {lead}
      <span> {highlight}</span>
    </>
  )
}

async function loadSiteContent() {
  try {
    const savedContent = await loadDocument(
      CMS_KEYS.SITE_CONTENT,
    )

    if (savedContent) {
      return mergeSiteContent(
        DEFAULT_SITE_CONTENT,
        savedContent,
      )
    }
  } catch (error) {
    console.error(
      'No se pudo cargar la configuración del sitio.',
      error,
    )
  }

  return mergeSiteContent(
    DEFAULT_SITE_CONTENT,
    readLocalFallback(
      'legado-matero-site-content',
      null,
    ),
  )
}

async function loadServices() {
  try {
    const savedServices = await loadDocument(
      CMS_KEYS.SERVICES,
    )

    if (Array.isArray(savedServices)) {
      return savedServices
    }
  } catch (error) {
    console.error(
      'No se pudieron cargar los servicios.',
      error,
    )
  }

  const localServices = readLocalFallback(
    'legado-matero-services',
    null,
  )

  if (Array.isArray(localServices)) {
    return localServices
  }

  return DEFAULT_SERVICES
}

async function loadAboutPoints() {
  try {
    const savedAboutPoints = await loadDocument(
      CMS_KEYS.ABOUT_POINTS,
    )

    if (Array.isArray(savedAboutPoints)) {
      return savedAboutPoints
    }
  } catch (error) {
    console.error(
      'No se pudieron cargar los puntos de Nosotros.',
      error,
    )
  }

  const localAboutPoints = readLocalFallback(
    'legado-matero-about-points',
    null,
  )

  if (Array.isArray(localAboutPoints)) {
    return localAboutPoints
  }

  return DEFAULT_ABOUT_POINTS
}

function normalizeImages(images) {
  if (!Array.isArray(images)) {
    return []
  }

  return images
    .map((image, index) => {
      if (typeof image === 'string') {
        return {
          id: `image-${index}`,
          url: image,
        }
      }

      if (image?.url) {
        return {
          id: image.id || `image-${index}`,
          url: image.url,
        }
      }

      return null
    })
    .filter(Boolean)
}

function normalizeVideos(videos) {
  if (!Array.isArray(videos)) {
    return []
  }

  return videos
    .map((video, index) => {
      if (typeof video === 'string') {
        return {
          id: `video-${index}`,
          url: video,
        }
      }

      if (video?.url) {
        return {
          id: video.id || `video-${index}`,
          url: video.url,
        }
      }

      return null
    })
    .filter(Boolean)
}

function getPortfolioImages(item) {
  const images = []

  if (item.coverImage) {
    images.push({
      id: 'cover',
      url: item.coverImage,
    })
  } else if (item.image) {
    images.push({
      id: 'cover',
      url: item.image,
    })
  }

  const screenshots = normalizeImages(
    item.screenshots || [],
  )

  const regularImages = normalizeImages(
    item.images || [],
  )

  ;[...screenshots, ...regularImages].forEach(
    (image) => {
      if (
        image.url &&
        !images.some(
          (existing) =>
            existing.url === image.url,
        )
      ) {
        images.push(image)
      }
    },
  )

  return images
}

function getMediaItems(item, isPortfolio = false) {
  const images = isPortfolio
    ? getPortfolioImages(item)
    : normalizeImages(
        item.images ||
          (item.image
            ? [
                {
                  id: 'cover',
                  url: item.image,
                },
              ]
            : []),
      )

  const videos = normalizeVideos(
    item.videos ||
      (item.video
        ? [item.video]
        : []),
  )

  const coverImage =
    item.coverImage ||
    item.image ||
    images[0]?.url ||
    ''

  const media = []

  if (coverImage) {
    media.push({
      id: 'cover',
      type: 'image',
      url: coverImage,
    })
  }

  images.forEach((image) => {
    if (
      image.url &&
      image.url !== coverImage
    ) {
      media.push({
        id: image.id,
        type: 'image',
        url: image.url,
      })
    }
  })

  videos.forEach((video) => {
    media.push({
      id: video.id,
      type: 'video',
      url: video.url,
    })
  })

  return media
}

function MediaCarousel({
  item,
  isPortfolio = false,
}) {
  const media = getMediaItems(
    item,
    isPortfolio,
  )

  const [currentIndex, setCurrentIndex] =
    useState(0)

  useEffect(() => {
    setCurrentIndex(0)
  }, [item?.id])

  if (media.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '16 / 9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border:
            '1px solid rgba(245,245,242,0.12)',
        }}
      >
        <div className="catalog-placeholder">
          <div className="catalog-shape"></div>
        </div>
      </div>
    )
  }

  const currentMedia = media[currentIndex]

  const previousMedia = () => {
    setCurrentIndex((current) =>
      current === 0
        ? media.length - 1
        : current - 1,
    )
  }

  const nextMedia = () => {
    setCurrentIndex((current) =>
      current === media.length - 1
        ? 0
        : current + 1,
    )
  }

  return (
    <div>
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          overflow: 'hidden',
          border:
            '1px solid rgba(245,245,242,0.12)',
          background: '#0D0D0D',
        }}
      >
        {currentMedia.type === 'video' ? (
          <video
            src={currentMedia.url}
            controls
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#000',
            }}
          />
        ) : (
          <img
            src={currentMedia.url}
            alt={
              item.title ||
              'LEGADO MATERO'
            }
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        )}

        {media.length > 1 && (
          <>
            <button
              type="button"
              onClick={previousMedia}
              aria-label="Imagen anterior"
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform:
                  'translateY(-50%)',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                border:
                  '1px solid rgba(245,245,242,0.35)',
                background:
                  'rgba(11,13,16,0.75)',
                color: '#FFFFFF',
                cursor: 'pointer',
                fontSize: '22px',
              }}
            >
              ‹
            </button>

            <button
              type="button"
              onClick={nextMedia}
              aria-label="Siguiente imagen"
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform:
                  'translateY(-50%)',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                border:
                  '1px solid rgba(245,245,242,0.35)',
                background:
                  'rgba(11,13,16,0.75)',
                color: '#FFFFFF',
                cursor: 'pointer',
                fontSize: '22px',
              }}
            >
              ›
            </button>
          </>
        )}
      </div>

      {media.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingTop: '12px',
            paddingBottom: '4px',
          }}
        >
          {media.map(
            (mediaItem, index) => (
              <button
                key={mediaItem.id}
                type="button"
                onClick={() =>
                  setCurrentIndex(index)
                }
                style={{
                  flex: '0 0 auto',
                  width: '72px',
                  height: '54px',
                  padding: 0,
                  overflow: 'hidden',
                  border:
                    index === currentIndex
                      ? '2px solid #7EC8F3'
                      : '1px solid rgba(245,245,242,0.18)',
                  background:
                    '#0D0D0D',
                  cursor: 'pointer',
                }}
              >
                {mediaItem.type ===
                'video' ? (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                      color:
                        '#7EC8F3',
                      fontSize:
                        '18px',
                    }}
                  >
                    ▶
                  </div>
                ) : (
                  <img
                    src={
                      mediaItem.url
                    }
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit:
                        'cover',
                      display:
                        'block',
                    }}
                  />
                )}
              </button>
            ),
          )}
        </div>
      )}

      {media.length > 1 && (
        <p
          style={{
            marginTop: '8px',
            fontSize: '12px',
            color: '#A7B6C2',
            textAlign: 'center',
          }}
        >
          {currentIndex + 1} / {media.length}
        </p>
      )}
    </div>
  )
}

/*
 * Íconos de los botones de contacto.
 * Van dibujados en el código (sin librerías) y toman el color del botón.
 */
function ContactIcon({ name, size = 18 }) {
  const shared = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    'aria-hidden': 'true',
    focusable: 'false',
    style: {
      marginRight: '10px',
      flexShrink: 0,
    },
  }

  if (name === 'whatsapp') {
    return (
      <svg {...shared} fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    )
  }

  if (name === 'linkedin') {
    return (
      <svg {...shared} fill="currentColor">
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11.5H3V9.75zm7 0h3.8v1.6h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1v5.85h-4v-5.2c0-1.24-.02-2.83-1.73-2.83-1.73 0-2 1.35-2 2.74v5.29h-4V9.75z" />
      </svg>
    )
  }

  if (name === 'instagram') {
    return (
      <svg
        {...shared}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle
          cx="17.5"
          cy="6.5"
          r="1.1"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    )
  }

  if (name === 'fiverr') {
    // "fi" con punto final, dibujado con trazos (no depende de ninguna tipografía)
    return (
      <svg
        {...shared}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8.5 20V9.6c0-2.3 1.2-3.6 3.6-3.6h.9" />
        <path d="M5.5 11.4h7" />
        <path d="M16.2 11.4V20" />
        <circle
          cx="16.2"
          cy="6.6"
          r="1.3"
          fill="currentColor"
          stroke="none"
        />
        <circle
          cx="20.8"
          cy="19.2"
          r="1.1"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    )
  }

  return (
    <svg
      {...shared}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 7.5l8.5 6 8.5-6" />
    </svg>
  )
}

/*
 * Arma el link de una red social a partir de lo que se cargó en el
 * administrador: acepta el link completo, "usuario" o "@usuario".
 */
function normalizeSocialLink(value, host, baseUrl) {
  const text = String(value || '').trim()

  if (!text) {
    return ''
  }

  if (/^https?:\/\//i.test(text)) {
    return text
  }

  if (text.toLowerCase().includes(host)) {
    return `https://${text}`
  }

  return `${baseUrl}${text.replace(/^[@/]+/, '')}`
}

function DetailModal({
  item,
  type,
  onClose,
  onEmail,
  contactEmail,
  whatsapp,
}) {
  if (!item) {
    return null
  }

  const features =
    typeof item.features === 'string'
      ? item.features
          .split('\n')
          .map((feature) =>
            feature.trim(),
          )
          .filter(Boolean)
      : Array.isArray(
            item.features,
          )
        ? item.features
        : []

  const isPortfolio =
    type === 'portfolio'

  const cleanWhatsapp = String(
    whatsapp || '',
  ).replace(/\D/g, '')

  const whatsappLink = cleanWhatsapp
    ? `https://wa.me/${cleanWhatsapp}`
    : '#contacto'

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background:
          'rgba(0,0,0,0.88)',
        overflowY: 'auto',
        padding: '24px',
      }}
    >
      <div
        onClick={(event) =>
          event.stopPropagation()
        }
        style={{
          width:
            'min(1100px, 100%)',
          margin: '0 auto',
          background: '#0D0D0D',
          border:
            '1px solid rgba(245,245,242,0.14)',
          padding:
            'clamp(20px, 4vw, 42px)',
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border:
              '1px solid rgba(245,245,242,0.25)',
            background:
              '#0D0D0D',
            color:
              '#FFFFFF',
            cursor:
              'pointer',
            fontSize:
              '22px',
            zIndex: 2,
          }}
        >
          ×
        </button>

        <div
          style={{
            marginBottom: '28px',
          }}
        >
          <p className="section-label">
            {isPortfolio
              ? '03 / PORTFOLIO'
              : '03 / CATÁLOGO'}
          </p>

          <h2
            style={{
              marginTop: '10px',
              paddingRight:
                '50px',
            }}
          >
            {item.title}
          </h2>

          {(item.category ||
            item.type) && (
            <p
              style={{
                marginTop:
                  '10px',
                color:
                  '#7EC8F3',
                textTransform:
                  'uppercase',
                letterSpacing:
                  '0.08em',
                fontSize:
                  '12px',
              }}
            >
              {item.category ||
                item.type}
            </p>
          )}
        </div>

        <MediaCarousel
          item={item}
          isPortfolio={
            isPortfolio
          }
        />

        {isPortfolio ? (
          <div
            style={{
              marginTop:
                '36px',
            }}
          >
            {item.description && (
              <div
                style={{
                  marginBottom:
                    '30px',
                }}
              >
                <p className="section-label">
                  SOBRE EL PROYECTO
                </p>

                <p
                  style={{
                    marginTop:
                      '12px',
                    color:
                      '#FFFFFF',
                    lineHeight:
                      1.8,
                    whiteSpace:
                      'pre-line',
                  }}
                >
                  {item.description}
                </p>
              </div>
            )}

            {item.client && (
              <div
                style={{
                  marginBottom:
                    '28px',
                }}
              >
                <p className="section-label">
                  CLIENTE
                </p>

                <p
                  style={{
                    marginTop:
                      '8px',
                    color:
                      '#FFFFFF',
                  }}
                >
                  {item.client}
                </p>
              </div>
            )}

            {item.link && (
              <div
                style={{
                  marginTop:
                    '30px',
                }}
              >
                <p className="section-label">
                  PROYECTO
                </p>

                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-button contact-button-primary"
                  style={{
                    display:
                      'inline-flex',
                    marginTop:
                      '12px',
                  }}
                  onClick={(
                    event,
                  ) =>
                    event.stopPropagation()
                  }
                >
                  Visitar proyecto
                  <span>↗</span>
                </a>
              </div>
            )}
          </div>
        ) : (
          <div
            className="detail-catalog-layout"
            style={{
              display: 'grid',
              gridTemplateColumns:
                'minmax(0, 1.6fr) minmax(240px, 0.8fr)',
              gap: '40px',
              marginTop:
                '36px',
            }}
          >
            <div className="detail-catalog-content">
              {item.description && (
                <div
                  style={{
                    marginBottom:
                      '28px',
                  }}
                >
                  <p
                    style={{
                      color:
                        '#FFFFFF',
                      lineHeight:
                        1.8,
                      whiteSpace:
                        'pre-line',
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              )}

              {item.features &&
                String(
                  item.features,
                ).trim().length >
                  0 && (
                <div
                  style={{
                    marginBottom:
                      '28px',
                  }}
                >
                  <p className="section-label">
                    CARACTERÍSTICAS
                  </p>

                  <p
                    style={{
                      color:
                        '#FFFFFF',
                      lineHeight:
                        1.8,
                      marginTop:
                        '14px',
                      whiteSpace:
                        'pre-line',
                    }}
                  >
                    {features.join(
                      ' ',
                    )}
                  </p>
                </div>
              )}

              {item.commercialInfo && (
                <div>
                  <p className="section-label">
                    INFORMACIÓN
                  </p>

                  <p
                    style={{
                      color:
                        '#FFFFFF',
                      marginTop:
                        '10px',
                      whiteSpace:
                        'pre-line',
                    }}
                  >
                    {
                      item.commercialInfo
                    }
                  </p>
                </div>
              )}
            </div>

            <div
              className="detail-catalog-actions"
              style={{
                borderLeft:
                  '1px solid rgba(245,245,242,0.12)',
                paddingLeft:
                  '28px',
                alignSelf:
                  'start',
              }}
            >
              <div
                style={{
                  marginBottom:
                    '24px',
                }}
              >
                <p className="section-label">
                  PRECIO
                </p>

                <strong
                  style={{
                    display:
                      'block',
                    marginTop:
                      '8px',
                    color:
                      '#FFFFFF',
                    fontSize:
                      '24px',
                  }}
                >
                  {item.price ||
                    '$ Consultar'}
                </strong>
              </div>

              <a
                href={whatsappLink}
                target={
                  whatsapp
                    ? '_blank'
                    : undefined
                }
                rel={
                  whatsapp
                    ? 'noreferrer'
                    : undefined
                }
                className="contact-button contact-button-primary"
                style={{
                  display:
                    'flex',
                  width:
                    '100%',
                  justifyContent:
                    'center',
                  marginBottom:
                    '12px',
                }}
                onClick={
                  onClose
                }
              >
                <ContactIcon name="whatsapp" />
                Consultar
                <span>↗</span>
              </a>

              <a
                href={`mailto:${contactEmail}`}
                className="contact-button"
                style={{
                  display:
                    'flex',
                  width:
                    '100%',
                  justifyContent:
                    'center',
                }}
                onClick={(
                  event,
                ) => {
                  event.preventDefault()

                  if (onEmail) {
                    onEmail()
                  }
                }}
              >
                <ContactIcon name="mail" />
                Contactar por mail
                <span>↗</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const CONTACT_GENERIC_ERROR =
  'No pudimos enviar tu consulta. Probá de nuevo en unos minutos.'

function EmailModal({
  onClose,
}) {
  const [form, setForm] =
    useState({
      name: '',
      clientEmail: '',
      phone: '',
      message: '',
      website: '',
    })

  const [status, setStatus] =
    useState('idle')

  const [errorMessage, setErrorMessage] =
    useState('')

  const handleChange = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault()

    if (status === 'sending') {
      return
    }

    setStatus('sending')
    setErrorMessage('')

    try {
      const response = await fetch(
        '/api/contact',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            name: form.name.trim(),
            email:
              form.clientEmail.trim(),
            phone: form.phone.trim(),
            message:
              form.message.trim(),
            website: form.website,
          }),
        },
      )

      let data = {}

      try {
        data = await response.json()
      } catch {
        data = {}
      }

      if (!response.ok) {
        setErrorMessage(
          data.error ||
            CONTACT_GENERIC_ERROR,
        )

        setStatus('error')
        return
      }

      setStatus('success')
    } catch (error) {
      console.error(
        'No se pudo enviar la consulta.',
        error,
      )

      setErrorMessage(
        CONTACT_GENERIC_ERROR,
      )

      setStatus('error')
    }
  }

  const labelStyle = {
    display: 'grid',
    gap: '8px',
  }

  const labelTextStyle = {
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  }

  const fieldStyle = {
    width: '100%',
    padding: '14px',
    border:
      '1px solid rgba(245,245,242,0.18)',
    background: '#0D0D0D',
    color: '#FFFFFF',
    outline: 'none',
  }

  const isSending =
    status === 'sending'

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background:
          'rgba(0,0,0,0.88)',
        overflowY: 'auto',
        padding: '24px',
      }}
    >
      <div
        onClick={(event) =>
          event.stopPropagation()
        }
        style={{
          width:
            'min(650px, 100%)',
          margin:
            '40px auto',
          background:
            '#0D0D0D',
          border:
            '1px solid rgba(245,245,242,0.14)',
          padding:
            'clamp(20px, 4vw, 42px)',
          position:
            'relative',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            position:
              'absolute',
            top: '16px',
            right: '16px',
            width: '40px',
            height: '40px',
            borderRadius:
              '50%',
            border:
              '1px solid rgba(245,245,242,0.25)',
            background:
              '#0D0D0D',
            color:
              '#FFFFFF',
            cursor:
              'pointer',
            fontSize:
              '22px',
          }}
        >
          ×
        </button>

        <p className="section-label">
          CONTACTO POR MAIL
        </p>

        {status === 'success' ? (
          <>
            <h2
              style={{
                marginTop:
                  '10px',
                paddingRight:
                  '45px',
              }}
            >
              ¡Gracias!
            </h2>

            <p
              style={{
                marginTop:
                  '14px',
                lineHeight:
                  1.7,
              }}
            >
              Recibimos tu consulta.
              Te vamos a contactar a
              la brevedad.
            </p>

            <button
              type="button"
              className="contact-button contact-button-primary"
              onClick={onClose}
              style={{
                width:
                  '100%',
                justifyContent:
                  'center',
                border:
                  'none',
                cursor:
                  'pointer',
                marginTop:
                  '28px',
              }}
            >
              Cerrar
            </button>
          </>
        ) : (
          <>
            <h2
              style={{
                marginTop:
                  '10px',
                paddingRight:
                  '45px',
              }}
            >
              Contanos tu idea.
            </h2>

            <p
              style={{
                marginTop:
                  '14px',
                lineHeight:
                  1.7,
              }}
            >
              Dejanos tus datos y tu
              consulta. Te vamos a
              responder a la
              brevedad.
            </p>

            <form
              onSubmit={
                handleSubmit
              }
              style={{
                display:
                  'grid',
                gap: '16px',
                marginTop:
                  '28px',
              }}
            >
              <label
                style={
                  labelStyle
                }
              >
                <span
                  style={
                    labelTextStyle
                  }
                >
                  Nombre
                </span>

                <input
                  name="name"
                  type="text"
                  value={
                    form.name
                  }
                  onChange={
                    handleChange
                  }
                  required
                  maxLength={120}
                  autoComplete="name"
                  placeholder="Tu nombre"
                  style={
                    fieldStyle
                  }
                />
              </label>

              <label
                style={
                  labelStyle
                }
              >
                <span
                  style={
                    labelTextStyle
                  }
                >
                  Email
                </span>

                <input
                  name="clientEmail"
                  type="email"
                  value={
                    form.clientEmail
                  }
                  onChange={
                    handleChange
                  }
                  required
                  maxLength={160}
                  autoComplete="email"
                  placeholder="tu@email.com"
                  style={
                    fieldStyle
                  }
                />
              </label>

              <label
                style={
                  labelStyle
                }
              >
                <span
                  style={
                    labelTextStyle
                  }
                >
                  Número de teléfono
                </span>

                <input
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  value={
                    form.phone
                  }
                  onChange={
                    handleChange
                  }
                  required
                  maxLength={40}
                  autoComplete="tel"
                  placeholder="+54 9 260 000 0000"
                  style={
                    fieldStyle
                  }
                />
              </label>

              <label
                style={
                  labelStyle
                }
              >
                <span
                  style={
                    labelTextStyle
                  }
                >
                  Consulta
                </span>

                <textarea
                  name="message"
                  value={
                    form.message
                  }
                  onChange={
                    handleChange
                  }
                  required
                  rows="6"
                  maxLength={4000}
                  placeholder="Contanos qué necesitás..."
                  style={{
                    ...fieldStyle,
                    resize:
                      'vertical',
                  }}
                />
              </label>

              <input
                name="website"
                type="text"
                value={
                  form.website
                }
                onChange={
                  handleChange
                }
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{
                  position:
                    'absolute',
                  left: '-9999px',
                  width: '1px',
                  height: '1px',
                  opacity: 0,
                }}
              />

              {status ===
                'error' && (
                <p
                  role="alert"
                  style={{
                    margin: 0,
                    color:
                      '#ff6b6b',
                    lineHeight:
                      1.6,
                  }}
                >
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                className="contact-button contact-button-primary"
                disabled={
                  isSending
                }
                style={{
                  width:
                    '100%',
                  justifyContent:
                    'center',
                  border:
                    'none',
                  cursor:
                    isSending
                      ? 'wait'
                      : 'pointer',
                  opacity:
                    isSending
                      ? 0.7
                      : 1,
                }}
              >
                {isSending
                  ? 'Enviando...'
                  : 'Enviar consulta'}

                <span>↗</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

function PublicSite() {
  const [catalog, setCatalog] =
    useState([])

  const [portfolio, setPortfolio] =
    useState([])

  const [services, setServices] =
    useState(DEFAULT_SERVICES)

  const [aboutPoints, setAboutPoints] =
    useState(
      DEFAULT_ABOUT_POINTS,
    )

  const [siteContent, setSiteContent] =
    useState(
      DEFAULT_SITE_CONTENT,
    )

  const [selectedItem, setSelectedItem] =
    useState(null)

  const [selectedType, setSelectedType] =
    useState(null)

  const [showEmailModal, setShowEmailModal] =
    useState(false)

  const detailHistoryRef = useRef(false)

  const loadRequestRef = useRef(0)

  const loadPublicData = async () => {
    const requestId =
      ++loadRequestRef.current

    try {
      let publications =
        await loadDocument(
          CMS_KEYS.PUBLICATIONS,
        )

      if (!Array.isArray(publications)) {
        publications =
          readLocalFallback(
            'legado-matero-publications',
            [],
          )
      }

      if (
        Array.isArray(publications) &&
        publications.length
      ) {
        const publishedPublications =
          publications
            .filter(
              (publication) =>
                publication.published,
            )
            .map(
              (
                publication,
                index,
              ) => ({
                ...publication,
                order:
                  Number(
                    publication.order,
                  ) ||
                  index + 1,
                images:
                  normalizeImages(
                    publication.images,
                  ),
                videos:
                  normalizeVideos(
                    publication.videos ||
                      (publication.video
                        ? [
                            publication.video,
                          ]
                        : []),
                  ),
                coverImage:
                  publication.coverImage ||
                  publication.images?.[0]
                    ?.url ||
                  '',
              }),
            )
            .sort(
              (a, b) =>
                Number(a.order) -
                Number(b.order),
            )
            .map(
              (
                publication,
                index,
              ) => ({
                ...publication,
                number:
                  String(
                    index + 1,
                  ).padStart(
                    2,
                    '0',
                  ),
              }),
            )

        if (
          requestId !==
          loadRequestRef.current
        ) {
          return
        }

        setCatalog(
          publishedPublications,
        )
      } else {
        setCatalog([])
      }

      let savedPortfolio =
        await loadDocument(
          CMS_KEYS.PORTFOLIO,
        )

      if (!Array.isArray(savedPortfolio)) {
        savedPortfolio =
          readLocalFallback(
            'legado-matero-portfolio',
            [],
          )
      }

      if (
        Array.isArray(savedPortfolio) &&
        savedPortfolio.length
      ) {
        const publishedProjects =
          savedPortfolio
            .filter(
              (project) =>
                project.published,
            )
            .map(
              (
                project,
                index,
              ) => ({
                ...project,
                order:
                  Number(
                    project.order,
                  ) ||
                  index + 1,
                link:
                  project.link ||
                  '',
                shortDescription:
                  project.shortDescription ||
                  '',
                images:
                  normalizeImages(
                    project.images ||
                      (project.image
                        ? [
                            {
                              id: 'cover',
                              url: project.image,
                            },
                          ]
                        : []),
                  ),
                screenshots:
                  normalizeImages(
                    project.screenshots ||
                      [],
                  ),
                videos:
                  normalizeVideos(
                    project.videos ||
                      (project.video
                        ? [
                            project.video,
                          ]
                        : []),
                  ),
                coverImage:
                  project.coverImage ||
                  project.image ||
                  project.images?.[0]
                    ?.url ||
                  project.screenshots?.[0]
                    ?.url ||
                  '',
              }),
            )
            .sort(
              (a, b) =>
                Number(a.order) -
                Number(b.order),
            )
            .map(
              (
                project,
                index,
              ) => ({
                ...project,
                number:
                  String(
                    index + 1,
                  ).padStart(
                    2,
                    '0',
                  ),
              }),
            )

        if (
          requestId !==
          loadRequestRef.current
        ) {
          return
        }

        setPortfolio(
          publishedProjects,
        )
      } else {
        setPortfolio([])
      }

      const [
        loadedSiteContent,
        loadedServices,
        loadedAboutPoints,
      ] = await Promise.all([
        loadSiteContent(),
        loadServices(),
        loadAboutPoints(),
      ])

      if (
        requestId !==
        loadRequestRef.current
      ) {
        return
      }

      setSiteContent(
        loadedSiteContent,
      )

      setServices(
        Array.isArray(
          loadedServices,
        )
          ? loadedServices
          : DEFAULT_SERVICES,
      )

      setAboutPoints(
        Array.isArray(
          loadedAboutPoints,
        )
          ? loadedAboutPoints
          : DEFAULT_ABOUT_POINTS,
      )
    } catch (error) {
      console.error(
        'No se pudieron cargar los datos públicos.',
        error,
      )
    }
  }

  useEffect(() => {
    loadPublicData()

    const handleStorage = () => {
      loadPublicData()
    }

    window.addEventListener(
      'storage',
      handleStorage,
    )

    return () => {
      window.removeEventListener(
        'storage',
        handleStorage,
      )
    }
  }, [])

  useEffect(() => {
    const handleFocus = () => {
      loadPublicData()
    }

    window.addEventListener(
      'focus',
      handleFocus,
    )

    return () => {
      window.removeEventListener(
        'focus',
        handleFocus,
      )
    }
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      if (
        detailHistoryRef.current
      ) {
        detailHistoryRef.current =
          false

        setSelectedItem(null)
        setSelectedType(null)

        document.body.style.overflow =
          ''
      }
    }

    window.addEventListener(
      'popstate',
      handlePopState,
    )

    return () => {
      window.removeEventListener(
        'popstate',
        handlePopState,
      )
    }
  }, [])

  const content =
    siteContent || DEFAULT_SITE_CONTENT

  const whatsappNumber =
    content.contact?.whatsapp ||
    ''

  const linkedinUrl =
    content.contact?.linkedin ||
    ''

  const normalizedLinkedinUrl =
    linkedinUrl &&
    !/^https?:\/\//i.test(
      linkedinUrl,
    )
      ? `https://${linkedinUrl}`
      : linkedinUrl

  const instagramLink = normalizeSocialLink(
    content.contact?.instagram,
    'instagram.com',
    'https://www.instagram.com/',
  )

  const fiverrLink = normalizeSocialLink(
    content.contact?.fiverr,
    'fiverr.com',
    'https://www.fiverr.com/',
  )

  const contactEmail =
    content.contact?.email ||
    DEFAULT_EMAIL

  const cleanWhatsapp = String(
    whatsappNumber || '',
  ).replace(/\D/g, '')

  const whatsappLink =
    cleanWhatsapp
      ? `https://wa.me/${cleanWhatsapp}`
      : '#contacto'

  const openDetail = (
    item,
    type,
  ) => {
    setSelectedItem(item)
    setSelectedType(type)

    document.body.style.overflow =
      'hidden'

    const detailHash =
      `${type}-${item.id}`

    window.history.pushState(
      {
        legadoMateroDetail: true,
        detailType: type,
        detailId: item.id,
      },
      '',
      `#${detailHash}`,
    )

    detailHistoryRef.current =
      true
  }

  const closeDetail = () => {
    if (
      detailHistoryRef.current
    ) {
      window.history.back()
      return
    }

    setSelectedItem(null)
    setSelectedType(null)

    document.body.style.overflow =
      ''
  }

  const openEmail = () => {
    setShowEmailModal(true)
    document.body.style.overflow =
      'hidden'
  }

  const closeEmail = () => {
    setShowEmailModal(false)

    document.body.style.overflow =
      detailHistoryRef.current
        ? 'hidden'
        : ''
  }

  return (
    <main className="site">
      <header className="navbar">
        <a
          href="#inicio"
          className="logo"
          aria-label="Ir al inicio"
          onClick={() => {
            if (
              detailHistoryRef.current
            ) {
              window.history.back()
            } else {
              closeDetail()
            }

            closeEmail()
          }}
        >
          <img
            src={logo}
            alt="LEGADO MATERO"
          />
        </a>

        <nav>
          <a href="#inicio">
            Inicio
          </a>

          <a href="#servicios">
            Productos
          </a>

          <a href="#nosotros">
            Nosotros
          </a>

          <a href="#catalogo">
            Catálogo
          </a>

          <a href="#contacto">
            Contacto
          </a>
        </nav>
      </header>

      <section
        id="inicio"
        className="hero"
      >
        <div className="hero-text">
          <p className="eyebrow">
            {content.home.eyebrow}
          </p>

          <h1>
            {renderHighlightedTitle(
              content.home.title,
            )}
          </h1>

          <p className="hero-description">
            {content.home.description}
          </p>

          <a
            href="#servicios"
            className="hero-button"
          >
            {content.home.button}
          </a>
        </div>

        <div className="hero-visual">
          <img
            src={heroImage}
            alt="Legado Matero"
            className="hero-image"
          />
        </div>
      </section>

      <section
        id="servicios"
        className="services"
      >
        <div className="services-header">
          <div className="services-banner">
            <img
              src={banner}
              alt="Productos Legado Matero"
              className="services-banner-image"
            />
          </div>

          <div className="services-text">
            <p className="section-label">
              {content.services.eyebrow}
            </p>

            <h2>
              {renderHighlightedTitle(
                content.services.title,
              )}
            </h2>

            <p className="services-intro">
              {
                content.services
                  .description
              }
            </p>
          </div>
        </div>

        <div className="services-grid">
          {services.map(
            (
              service,
              index,
            ) => (
              <article
                className="service-card"
                key={
                  service.id ||
                  index
                }
              >
                <div className="service-top">
                  <span>
                    {service.number ||
                      String(
                        index + 1,
                      ).padStart(
                        2,
                        '0',
                      )}
                  </span>

                  <div className="service-mark">
                    <svg
                      className="service-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <line
                        x1="6"
                        y1="4"
                        x2="16.5"
                        y2="14.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="6"
                        cy="4"
                        r="1.7"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                      <ellipse
                        cx="19"
                        cy="17"
                        rx="3.1"
                        ry="2.1"
                        transform="rotate(45 19 17)"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                    </svg>
                  </div>
                </div>

                <div className="service-content">
                  <h3>
                    {
                      service.title
                    }
                  </h3>

                  <p>
                    {
                      service.description
                    }
                  </p>
                </div>

                <a
                  href="#catalogo"
                  className="service-more"
                >
                  Ver más
                  <span>↗</span>
                </a>
              </article>
            ),
          )}
        </div>
      </section>

      <section
        id="nosotros"
        className="about"
      >
        <div className="about-header">
          <p className="section-label">
            {content.about.eyebrow}
          </p>

          <h2>
            {renderHighlightedTitle(
              content.about.title,
            )}
          </h2>
        </div>

        <div className="about-content">
          <div className="about-main">
            <p className="about-lead">
              {content.about.lead}
            </p>

            <p>
              {
                content.about
                  .description
              }
            </p>
          </div>

          <div className="about-side">
            {aboutPoints.map(
              (
                point,
                index,
              ) => (
                <div
                  className="about-line"
                  key={
                    point.id ||
                    index
                  }
                >
                  <span>
                    {point.number ||
                      String(
                        index + 1,
                      ).padStart(
                        2,
                        '0',
                      )}
                  </span>

                  <strong>
                    {
                      point.title
                    }
                  </strong>

                  <p>
                    {
                      point.description
                    }
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <section
        id="catalogo"
        className="catalog"
      >
        <div className="catalog-header">
          <div>
            <p className="section-label">
              {content.catalog.eyebrow}
            </p>

            <h2>
              {renderHighlightedTitle(
                content.catalog.title,
              )}
            </h2>
          </div>

          <p className="catalog-intro">
            {
              content.catalog
                .description
            }
          </p>
        </div>

        {catalog.length ===
        0 ? (
          <div
            style={{
              padding:
                '60px 20px',
              textAlign:
                'center',
              border:
                '1px solid rgba(245,245,242,0.12)',
            }}
          >
            <p>
              Próximamente
              encontrarás aquí
              nuestros productos y
              servicios.
            </p>
          </div>
        ) : (
          <div className="catalog-grid">
            {catalog.map(
              (item) => (
                <article
                  className="catalog-card"
                  key={item.id}
                  onClick={() =>
                    openDetail(
                      item,
                      'catalog',
                    )
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(
                    event,
                  ) => {
                    if (
                      event.key ===
                        'Enter' ||
                      event.key ===
                        ' '
                    ) {
                      openDetail(
                        item,
                        'catalog',
                      )
                    }
                  }}
                  style={{
                    cursor:
                      'pointer',
                  }}
                >
                  <div className="catalog-image">
                    <span>
                      {
                        item.number
                      }
                    </span>

                    {item.coverImage ? (
                      <img
                        src={
                          item.coverImage
                        }
                        alt={
                          item.title
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
                    ) : (
                      <div className="catalog-placeholder">
                        <div className="catalog-shape"></div>
                      </div>
                    )}
                  </div>

                  <div className="catalog-info">
                    <div className="catalog-top">
                      <p className="catalog-category">
                        {
                          item.category
                        }
                      </p>

                      <span className="catalog-arrow">
                        ↗
                      </span>
                    </div>

                    <h3>
                      {
                        item.title
                      }
                    </h3>

                    <p className="catalog-description">
                      {
                        item.description
                      }
                    </p>

                    <div className="catalog-bottom">
                      <strong>
                        {item.price ||
                          '$ Consultar'}
                      </strong>

                      <span>
                        Ver ficha
                        <span>
                          ↗
                        </span>
                      </span>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>

      <section
        id="contacto"
        className="contact"
      >
        <div className="contact-layout">
          <div className="contact-inner contact-inner-centered">
            <div className="contact-header">
              <p className="section-label">
                {content.contact.eyebrow}
              </p>

              <h2>
                {
                  content.contact
                    .title
                }
              </h2>

              <p>
                {
                  content.contact
                    .description
                }
              </p>
            </div>

            <div className="contact-actions">
              <a
                href={
                  whatsappLink
                }
                className="contact-button"
                target={
                  whatsappNumber
                    ? '_blank'
                    : undefined
                }
                rel={
                  whatsappNumber
                    ? 'noreferrer'
                    : undefined
                }
              >
                <ContactIcon name="whatsapp" />
                WhatsApp
              </a>

              {instagramLink && (
                <a
                  href={instagramLink}
                  className="contact-button"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ContactIcon name="instagram" />
                  Instagram
                </a>
              )}

              <button
                type="button"
                className="contact-button"
                onClick={
                  openEmail
                }
              >
                <ContactIcon name="mail" />
                Mail
              </button>
            </div>
          </div>

          <div className="contact-banner">
            <img
              src={contactBanner}
              alt="Legado Matero"
              className="contact-banner-image"
            />
          </div>
        </div>

        <div className="contact-footer">
          <div
            style={{
              display:
                'flex',
              flexDirection:
                'column',
              gap: '8px',
            }}
          >
            <span>
              LEGADO MATERO
            </span>

            <span>
              NO VENDEMOS MATES.
              COMPARTIMOS UN LEGADO.
            </span>

            <a
              href={`mailto:${contactEmail}`}
              onClick={(
                event,
              ) => {
                event.preventDefault()
                openEmail()
              }}
              style={{
                color:
                  '#FFFFFF',
                transition:
                  'color 0.2s ease',
              }}
            >
              {contactEmail}
            </a>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <a
              href="/admin"
              className="admin-access"
            >
              ADMIN
            </a>
          </div>
        </div>

        <div className="dev-credit">
          <span>Desarrollado por PLANO LABS</span>

          <a href="mailto:plano.labs.ideas@gmail.com">
            plano.labs.ideas@gmail.com
          </a>

          <a
            href="https://wa.me/5492604669665"
            target="_blank"
            rel="noreferrer"
            className="dev-credit-whatsapp"
          >
            <ContactIcon name="whatsapp" />
            +549 2604669665
          </a>
        </div>
      </section>

      {selectedItem && (
        <DetailModal
          item={selectedItem}
          type={selectedType}
          onClose={
            closeDetail
          }
          onEmail={
            openEmail
          }
          contactEmail={
            contactEmail
          }
          whatsapp={
            whatsappNumber
          }
        />
      )}

      {showEmailModal && (
        <EmailModal
          onClose={
            closeEmail
          }
        />
      )}
    </main>
  )
}

function App() {
  const path =
    window.location.pathname

  if (
    path === '/admin' ||
    path === '/admin/login'
  ) {
    return <Login />
  }

  if (
    path === '/admin/dashboard'
  ) {
    return <Admin />
  }

  return <PublicSite />
}

export default App
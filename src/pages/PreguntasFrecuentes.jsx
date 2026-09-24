import { useState } from 'react'
import './PreguntasFrecuentes.css'

const FAQ_ITEMS = [
  {
    question: '¿Los mates vienen curados?',
    answer:
      'Sí, todos nuestros mates se entregan curados y listos para usar desde el primer momento.',
  },
  {
    question: '¿Hacen envíos a todo el país?',
    answer:
      'Sí, hacemos envíos a todo Argentina. El costo y el tiempo de entrega se calculan según tu localidad.',
  },
  {
    question: '¿Cómo se puede pagar?',
    answer:
      'Aceptamos transferencia bancaria, Mercado Pago y las principales tarjetas de crédito y débito.',
  },
  {
    question: '¿Cuáles son los plazos de entrega?',
    answer:
      'En CABA y GBA suele demorar entre 2 y 4 días hábiles; al resto del país, entre 5 y 10 días hábiles según la zona.',
  },
  {
    question: '¿Puedo cambiar o devolver un producto?',
    answer:
      'Sí, tenés 10 días desde que lo recibís para cambiarlo si no lo usaste y conserva su packaging original.',
  },
  {
    question: '¿Los mates tienen garantía?',
    answer:
      'Sí, todos nuestros productos tienen garantía por defectos de fabricación. Ante cualquier problema, escribinos y lo resolvemos.',
  },
  {
    question: '¿Hacen sets personalizados o para regalo?',
    answer:
      'Sí, armamos sets con mate, termo y bombilla combinados, con opción de presentación para regalo.',
  },
  {
    question: '¿Venden al por mayor?',
    answer:
      'Sí, contamos con precios especiales para compras mayoristas. Escribinos por WhatsApp o mail para más información.',
  },
  {
    question: '¿Cómo cuido mi mate para que dure más?',
    answer:
      'Te recomendamos lavarlo solo con agua (sin jabón) y dejarlo secar boca abajo entre usos, para conservar el curado.',
  },
]

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="faq-item">
      <button
        type="button"
        className="faq-question"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span>{item.question}</span>
        <span className="faq-toggle">{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen && <p className="faq-answer">{item.answer}</p>}
    </div>
  )
}

function PreguntasFrecuentes() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggleIndex = (index) => {
    setOpenIndex((current) => (current === index ? null : index))
  }

  return (
    <main className="faq-page">
      <div className="faq-inner">
        <a href="/" className="faq-back">
          ← Volver al inicio
        </a>

        <p className="section-label">PREGUNTAS FRECUENTES</p>

        <h1 className="faq-title">
          Todo lo que necesitás
          <span> saber antes de empezar.</span>
        </h1>

        <div className="faq-list">
          {FAQ_ITEMS.map((item, index) => (
            <FaqItem
              key={item.question}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => toggleIndex(index)}
            />
          ))}
        </div>
      </div>
    </main>
  )
}

export default PreguntasFrecuentes

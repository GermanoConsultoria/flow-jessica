'use client'

const NUMERO_WHATSAPP = '5519997012163'
const MENSAGEM_WHATSAPP = 'Olá, gostaria de um suporto em relação ao sistema Flow.Franzo, pode me ajudar?'

export default function BotaoWhatsApp() {
  const link = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(MENSAGEM_WHATSAPP)}`

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      title="Suporte via WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl"
    >
      <svg viewBox="0 0 32 32" width="30" height="30" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.004 3C9.376 3 4 8.373 4 15c0 2.386.7 4.61 1.906 6.484L4 29l7.72-1.865A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.75c-1.98 0-3.82-.55-5.396-1.505l-.386-.23-4.58 1.107 1.223-4.462-.252-.41A9.71 9.71 0 0 1 5.25 15c0-5.938 4.816-10.75 10.754-10.75S26.75 9.062 26.75 15 21.938 24.75 16.004 24.75Zm5.914-8.06c-.324-.163-1.918-.946-2.215-1.054-.297-.108-.513-.163-.73.163-.216.325-.838 1.054-1.028 1.271-.19.216-.378.244-.702.081-.324-.163-1.368-.504-2.606-1.608-.964-.86-1.615-1.922-1.805-2.246-.19-.325-.02-.5.143-.663.146-.146.324-.379.486-.568.163-.19.216-.325.324-.542.108-.216.054-.406-.027-.568-.081-.163-.73-1.76-1-2.41-.263-.632-.53-.546-.73-.556l-.622-.011c-.216 0-.568.081-.865.406-.297.325-1.135 1.108-1.135 2.703s1.162 3.136 1.324 3.352c.163.216 2.287 3.49 5.54 4.895.774.334 1.378.534 1.848.683.776.247 1.483.212 2.042.129.623-.093 1.918-.784 2.19-1.541.27-.758.27-1.407.19-1.542-.081-.135-.298-.216-.622-.379Z"/>
      </svg>
    </a>
  )
}

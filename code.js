/* 
    en el vídeo usamos "https://esm.run/@mlc-ai/web-llm"
    el problema es que eso siempre es la versión más reciente
    en el código usamos https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.46/+esm
    para fijar la versión */

//import { CreateWebWorkerMLCEngine } from "https://esm.run/@mlc-ai/web-llm"
import { CreateWebWorkerMLCEngine } from "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.78/+esm"

const $ = el => document.querySelector(el)

// pongo delante de la variable un símbolo de $
// para indicar que es un elemento del DOM
const $form = $('form')
const $input = $('input')
const $template = $('#message-template')
const $messages = $('ul')
const $container = $('main')
const $button = $('button')
const $info = $('small')
const $loading = $('.loading')

let messages = []
let end = false
let pregunta = "1"

const SELECTED_MODEL = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';// vram_required_MB: 879.04
//const SELECTED_MODEL = 'Llama-3-8B-Instruct-q4f32_1-MLC-1k' // vram_required_MB: 5295.7
//const SELECTED_MODEL = 'Llama-3-8B-Instruct-q4f32_1-MLC';// 

const engine = await CreateWebWorkerMLCEngine(
    new Worker('./worker.js', { type: 'module' }),
    SELECTED_MODEL,
    {
        initProgressCallback: (info) => {
            $info.textContent = info.text
            if (info.progress === 1 && !end) {
                end = true
                $loading?.parentNode?.removeChild($loading)
                $button.removeAttribute('disabled')
                addMessage("Buenos días Dr. Galindo. Espero que su jornada este transcurriendo sin inconvenientes. Le informo que su próximo paciente, Johan Saenz Ramos, de 39 años, está listo para la consulta.", 'bot')
                addMessage("Motivo de consulta: Fuerte dolor de cabeza en los últimos 20 días. Además, se reportan antecedentes relevantes de hipoglicemia, sus padres sufren de hipertensión y su abuela materna murió de diabetes, manifiesta tener episodios frecuentes de estrés, paciente con poca actividad física, fuma, toma alcohol y es alérgico a los AINE.Para un paciente con estas características, es importante abordar tanto los síntomas actuales cómo los factores de riesgo a largo plazo, Aquí tienes un plan de manejo sugerido:1.	Realizar una evaluación médica completa: Realizar estudios para determinar la causa de los dolores de cabeza. Monitorear niveles de glucosa en sangre debido a sus antecedentes y Evaluar presión arterial regularmente, considerando el historial familiar.2.	Modificaciones en su estilo de vida: Actividad física, dieta saludable, dejar de fumar, hidratación y rutinas adecuadas de sueño.3.	Manejo de los dolores de cabeza: Dado que es alérgico a los AINE, considerar alternativas cómo terapias no farmacológicas como compresas frías o técnicas de relajación, identificar y evitar desencadenantes de estrés.Cómo asistente, mi objetivo es ofrecer información y sugerencias que puedan complementar el criterio clínico y profesional del médico tratante. Reconozco que cada paciente es único y que las decisiones finales sobre su manejo deben ser tomadas por el profesional. Estoy aquí como apoyo y herramienta para enriquecer el proceso de atención médica. ¡Gracias por confiar en mí para colaborar en esta misión tan importante!", 'bot')
                $input.focus()
            }
        }
    }
)

$form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const messageText = $input.value.trim()

    if (messageText !== '') {
        // añadimos el mensaje en el DOM
        $input.value = ''
    }

    addMessage(messageText, 'user')
    $button.setAttribute('disabled', '')

    const userMessage = {
        role: 'user',
        content: messageText
    }

    messages.push(userMessage)

    const chunks = await engine.chat.completions.create({
        messages,
        stream: true
    })

    let reply = ""

    const $botMessage = addMessage("", 'bot')

    if (pregunta == "") {
        for await (const chunk of chunks) {
            $botMessage.textContent = ""
            reply = ""
        }
        pregunta = "";

    }

    //console.log(messages);

    $button.removeAttribute('disabled')

    messages.push({
        role: 'assistant',
        content: reply,
    })

    $container.scrollTop = $container.scrollHeight

})

function addMessage(text, sender) {
    // clonar el template
    const clonedTemplate = $template.content.cloneNode(true)
    const $newMessage = clonedTemplate.querySelector('.message')

    const $who = $newMessage.querySelector('span')
    const $text = $newMessage.querySelector('p')

    $text.textContent = text
    $who.textContent = sender === 'bot' ? 'Asistente' : 'Tú'
    $newMessage.classList.add(sender)

    $messages.appendChild($newMessage)

    $container.scrollTop = $container.scrollHeight

    return $text
}

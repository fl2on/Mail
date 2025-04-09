;
(() => {
    const devToolsChecker = setInterval(() => {
        const widthThreshold = window.outerWidth - window.innerWidth > 160
        const heightThreshold = window.outerHeight - window.innerHeight > 160

        if (widthThreshold || heightThreshold) {
            document.body.innerHTML = ""
            document.head.innerHTML = ""
            window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            clearInterval(devToolsChecker)
        }
    }, 100)

    const realFunctions = {}

    const protectedFunctionNames = [
        "goToStep",
        "completeVerification",
        "verifyCaptcha",
        "verifyInteractiveChallenge",
        "generateCaptcha",
        "copyEmailToClipboard",
        "displayProtectedEmail",
    ]

    window.addEventListener("DOMContentLoaded", () => {
        protectedFunctionNames.forEach((funcName) => {
            if (typeof window[funcName] === "function") {
                realFunctions[funcName] = window[funcName]
                Object.defineProperty(window, funcName, {
                    get: () => {
                        // Si se accede desde la consola o desde un contexto no autorizado
                        if (new Error().stack.includes("eval") || !window._secureContext) {
                            console.error("Security violation detected")
                            document.body.innerHTML = ""
                            window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                            return () => false
                        }
                        return realFunctions[funcName]
                    },
                    configurable: false,
                })
            }
        })

        window._secureContext = true
    })
})()

// =========================================
// ANTI-BOT & ANTI-CLONING PROTECTION
// =========================================

/**
 * Configuración del sistema de detección de robots
 */
const botDetectionConfig = {
    minHumanMouseMovements: 1,
    maxSuspiciousScore: 30,
    maxVerificationAttempts: 5,
    honeypotFieldIds: ["website"],
}

/**
 * Puntuación de detección de bots: cuanto más alta, más probable es que sea un bot
 */
const botScore = 0

/**
 * Almacena la primera vez que el usuario interactúa con la página
 */
const firstInteractionTime = null

/**
 * Captura los movimientos del ratón para detectar automatismos
 */
let mouseMovements = 0
let lastMousePosition = {
    x: 0,
    y: 0
}

document.addEventListener("mousemove", (e) => {
    mouseMovements++
    lastMousePosition = {
        x: e.clientX,
        y: e.clientY
    }
})

/**
 * Comprueba si el campo honeypot está lleno (los bots suelen llenar todos los campos)
 */
function checkHoneypot() {
    const honeypot = document.getElementById("website")
    return honeypot && honeypot.value.length > 0
}

/**
 * Protección anticlonación
 */
function setupAntiCloningProtection() {
    const sessionToken = Date.now().toString(36) + Math.random().toString(36).substring(2)

    try {
        sessionStorage.setItem("_auth_token", sessionToken)
    } catch (e) {
        // Silent fail para navegación privada
    }

    setInterval(() => {
        try {
            if (sessionStorage.getItem("_auth_token") !== sessionToken) {
                redirectToTroll("clone")
            }
        } catch (e) {
            // Silent fail
        }
    }, 2000)

    if (window.self !== window.top) {
        redirectToTroll("iframe")
    }

    if (
        window.location.hostname.includes("same.dev") ||
        window.location.hostname.includes("replit") ||
        window.location.hostname.includes("glitch.me") ||
        window.location.hostname.includes("codepen.io")
    ) {
        redirectToTroll("sandbox")
    }

    const userAgent = navigator.userAgent.toLowerCase()
    if (
        userAgent.includes("bot") ||
        userAgent.includes("crawler") ||
        userAgent.includes("spider") ||
        userAgent.includes("headless") ||
        userAgent.includes("lighthouse") ||
        userAgent.includes("pagespeed") ||
        userAgent.includes("curl") ||
        userAgent.includes("wget")
    ) {
        redirectToTroll("bot")
    }
}

/**
 * Muestra un mensaje de sesión invalidada con estilo mejorado
 */
function showSessionInvalidMessage(customMessage) {
    // Crear el contenedor principal
    const sessionInvalid = document.createElement("div")
    sessionInvalid.className = "session-invalid"

    // Icono de error
    const icon = document.createElement("div")
    icon.className = "session-invalid-icon"
    icon.innerHTML = "⚠️"

    // Título
    const title = document.createElement("h2")
    title.className = "session-invalid-title"
    title.textContent = "Security Alert"

    // Mensaje
    const message = document.createElement("p")
    message.className = "session-invalid-message"
    message.textContent =
        customMessage ||
        "Your session has been invalidated due to security concerns. This may happen if the page has been cloned or tampered with."

    // Botón para recargar
    const button = document.createElement("button")
    button.className = "session-invalid-button"
    button.textContent = "Reload Page"
    button.addEventListener("click", () => {
        redirectToTroll("reload")
    })

    // Añadir elementos al contenedor
    sessionInvalid.appendChild(icon)
    sessionInvalid.appendChild(title)
    sessionInvalid.appendChild(message)
    sessionInvalid.appendChild(button)

    // Añadir al body
    document.body.appendChild(sessionInvalid)
}

/**
 * Redirige a un trolleo según el tipo de ataque
 */
function redirectToTroll(type) {
    // Guardar el tipo de ataque para estadísticas
    try {
        localStorage.setItem("_security_breach", type)
    } catch (e) {
        // Silent fail
    }

    const trollUrls = {
        clone: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        iframe: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        sandbox: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        bot: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        devtools: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        reload: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        default: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    }

    // Si es un bot o curl, devolver un código de error
    if (type === "bot") {
        document.body.innerHTML = "<h1>403 Forbidden</h1><p>Access denied</p>"
        return
    }

    // Redirigir a la URL de trolleo
    window.location.href = trollUrls[type] || trollUrls.default
}

// =========================================
// ANTI-DEVTOOLS PROTECTION
// =========================================

// Modificar la función setupDevToolsProtection para redirigir inmediatamente al rickroll
function setupDevToolsProtection() {
    // Método 1: Detección por cambio de tamaño de la ventana
    const devtoolsOpen = false
    const threshold = 160 // Umbral para detectar la apertura de devtools

    // Función para verificar si las devtools están abiertas
    function checkDevTools() {
        // Método 1: Detección por diferencia entre ventana interna y externa
        const widthThreshold = window.outerWidth - window.innerWidth > threshold
        const heightThreshold = window.outerHeight - window.innerHeight > threshold

        // Si las devtools están abiertas por este método, redirigir
        if (widthThreshold || heightThreshold) {
            window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }
    }

    // Verificar periódicamente con menor frecuencia para evitar falsos positivos
    setInterval(checkDevTools, 2000)

    // También verificar en cambios de tamaño de ventana
    window.addEventListener("resize", checkDevTools)

    // Protección contra acceso a propiedades del DOM
    const originalGetElementById = document.getElementById
    document.getElementById = (id) => {
        if (id === "email-display" || id === "copied-message") {
            // Verificar si se llama desde un contexto no autorizado
            if (!window._secureContext || new Error().stack.includes("eval")) {
                console.log("Intento de acceso al correo detectado")
                window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                return null
            }
        }
        return originalGetElementById.call(document, id)
    }

    // Protección contra scraping
    // Añadir elementos falsos para confundir a los scrapers
    for (let i = 0; i < 5; i++) {
        const fakeEmail = document.createElement("div")
        fakeEmail.style.display = "none"
        fakeEmail.className = "email-display"
        fakeEmail.textContent = `fake-email-${i}@example.com`
        document.body.appendChild(fakeEmail)
    }
}

/**
 * Oculta el código real cuando se detectan las herramientas de desarrollador
 */
function hideRealCode() {
    // Guardar el código original si no se ha hecho ya
    if (!window._originalCode) {
        window._originalCode = {
            body: document.body.innerHTML,
            scripts: Array.from(document.scripts).map((script) => ({
                src: script.src,
                content: script.innerHTML,
            })),
        }

        // Vaciar completamente todos los scripts
        Array.from(document.scripts).forEach((script) => {
            if (!script.src) {
                script.innerHTML = ""
            }
        })

        // Eliminar todos los comentarios del HTML
        const commentRegex = /<!--[\s\S]*?-->/g
        document.body.innerHTML = document.body.innerHTML.replace(commentRegex, "")

        // Ocultar elementos importantes
        document.querySelectorAll(".captcha-container, #interactive-challenge, #email-display").forEach((el) => {
            if (el) el.style.visibility = "hidden"
        })

        // Añadir mensaje de advertencia en la consola
        console.clear()
        console.log("%c⚠️ Security Alert", "font-size:24px; color:red; font-weight:bold")
        console.log("%cThis website is protected against inspection and tampering.", "font-size:16px; color:red;")
        console.log(
            "%cAny attempt to modify or extract code may result in session termination.",
            "font-size:14px; color:orange;",
        )

        // Añadir un falso correo electrónico para engañar
        if (document.getElementById("email-display")) {
            document.getElementById("email-display").innerHTML = "definitely-not-a-troll@example.com"
        }

        // Sobrescribir funciones nativas para evitar manipulación
        window.completeVerification = () => {
            redirectToTroll("devtools")
        }

        window.goToStep = () => {
            redirectToTroll("devtools")
        }

        window.displayProtectedEmail = () => {
            redirectToTroll("devtools")
        }

        window.copyEmailToClipboard = () => {
            redirectToTroll("devtools")
        }

        // Sobrescribir console.log y otras funciones de consola
        const originalConsole = {
            ...console
        }
        for (const method in console) {
            if (typeof console[method] === "function") {
                console[method] = () => {
                    originalConsole.warn("Console access is restricted")
                    return undefined
                }
            }
        }

        // Solo permitir algunos métodos específicos
        console.log = originalConsole.log
        console.warn = originalConsole.warn
        console.error = originalConsole.error
    }
}

/**
 * Restaura el código original si es necesario
 */
function restoreRealCode() {
    if (window._originalCode) {
        // En un entorno real, podríamos restaurar el código original
        // Pero para mayor seguridad, simplemente recargamos la página
        window.location.reload()
    }
}

// =========================================
// UTILITY FUNCTIONS
// =========================================

/**
 * DOM element selector helper
 */
function $(selector) {
    return document.querySelector(selector)
}

/**
 * Generates a random integer between min and max (inclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Shuffles array in place
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
    }
    return array
}

// =========================================
// ADVANCED CAPTCHA GENERATOR
// =========================================

let captchaText = ""
let captchaRotation = 0

function generateCaptcha() {
    const canvas = document.getElementById("captcha-canvas")
    if (!canvas) {
        console.error("Canvas element not found")
        return
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) {
        console.error("Canvas context not available")
        return
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Cambiar la generación de caracteres para usar un conjunto más legible
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Eliminados caracteres ambiguos
    captchaText = ""

    // Generar un captcha de solo 4 caracteres para mayor legibilidad
    for (let i = 0; i < 4; i++) {
        captchaText += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    // Modificar el tamaño del canvas para dar más espacio
    canvas.width = 180
    canvas.height = 70

    // Decide el tipo de captcha (0: normal, 1: rotado, 2: ondulado)
    const captchaType = randomInt(0, 2)

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
    gradient.addColorStop(0, "#4338ca")
    gradient.addColorStop(1, "#6366f1")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.15})` // Reducida la opacidad
        ctx.beginPath()
        ctx.arc(randomInt(0, canvas.width), randomInt(0, canvas.height), randomInt(1, 2), 0, Math.PI * 2)
        ctx.fill()
    }

    for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`
        ctx.lineWidth = 1 // Líneas más finas
        ctx.beginPath()
        ctx.moveTo(randomInt(0, canvas.width), randomInt(0, canvas.height))
        ctx.bezierCurveTo(
            randomInt(0, canvas.width),
            randomInt(0, canvas.height),
            randomInt(0, canvas.width),
            randomInt(0, canvas.height),
            randomInt(0, canvas.width),
            randomInt(0, canvas.height),
        )
        ctx.stroke()
    }

    if (captchaType === 1) {
        captchaRotation = randomInt(-30, 30)

        ctx.save()

        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((captchaRotation * Math.PI) / 180)
        ctx.translate(-canvas.width / 2, -canvas.height / 2)

        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 28px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(captchaText, canvas.width / 2, canvas.height / 2)

        ctx.restore()
    } else if (captchaType === 2) {
        captchaRotation = 0

        const startX = 25 // Ajustar posición inicial
        const charWidth = 40 // Ancho fijo por carácter

        ctx.font = "bold 28px Arial"

        for (let i = 0; i < captchaText.length; i++) {
            const char = captchaText[i]
            const x = startX + i * charWidth // Espaciado fijo
            const y = canvas.height / 2 + Math.sin(i * 0.5) * 10

            ctx.save()
            ctx.translate(x, y)
            ctx.rotate((Math.sin(i) * Math.PI) / 20)
            ctx.fillStyle = "#ffffff"
            ctx.fillText(char, 0, 0)
            ctx.restore()
        }
    } else {
        // Captcha normal con caracteres distorsionados
        captchaRotation = 0

        // Dibuja cada personaje con una distorsión individual
        for (let i = 0; i < captchaText.length; i++) {
            ctx.save()

            // Aumentar el espaciado entre caracteres
            const x = 25 + i * 45 // Más espacio entre caracteres (era 30 + i * 40)
            const y = canvas.height / 2 + randomInt(-5, 5)

            ctx.translate(x, y)
            ctx.rotate((randomInt(-15, 15) * Math.PI) / 180)

            // Añadir sombra para dar profundidad
            ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
            ctx.shadowBlur = 4
            ctx.shadowOffsetX = 2
            ctx.shadowOffsetY = 2

            // Variaciones aleatorias del color del texto
            ctx.fillStyle = "#ffffff"
            ctx.font = `bold ${randomInt(26, 32)}px Arial`
            ctx.fillText(captchaText[i], 0, 0)

            ctx.restore()
        }
    }

    // Añade un borde sutil
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, canvas.width, canvas.height)

    console.log("Captcha generated:", captchaText) // Añadir log para depuración
    return captchaType
}

// =========================================
// RETOS INTERACTIVOS
// =========================================

let currentChallenge = null
let challengeAnswer = null

function generateInteractiveChallenge() {
    const container = document.getElementById("interactive-challenge")
    if (!container) return

    container.innerHTML = ""

    // Elija un tipo de desafío aleatorio
    const challengeType = randomInt(0, 2)
    currentChallenge = challengeType

    if (challengeType === 0) {
        // Desafío del deslizador
        challengeAnswer = randomInt(0, 100)

        const sliderContainer = document.createElement("div")
        sliderContainer.className = "slider-container"

        const sliderTrack = document.createElement("div")
        sliderTrack.className = "slider-track"

        const sliderThumb = document.createElement("div")
        sliderThumb.className = "slider-thumb"
        sliderThumb.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>'

        const valueDisplay = document.createElement("div")
        valueDisplay.className = "slider-value"
        valueDisplay.textContent = "0%"

        sliderContainer.appendChild(sliderTrack)
        sliderContainer.appendChild(sliderThumb)
        sliderContainer.appendChild(valueDisplay)

        const instructions = document.createElement("p")
        instructions.textContent = `Move the slider to match the target value: ${challengeAnswer}%`
        instructions.style.marginBottom = "1.5rem"

        container.appendChild(instructions)
        container.appendChild(sliderContainer)

        // Slider interaction
        let isDragging = false
        let currentValue = 0

        sliderThumb.addEventListener("mousedown", startDrag)
        sliderContainer.addEventListener("click", jumpTo)

        function startDrag(e) {
            e.preventDefault()
            isDragging = true
            document.addEventListener("mousemove", drag)
            document.addEventListener("mouseup", stopDrag)
        }

        function jumpTo(e) {
            const rect = sliderContainer.getBoundingClientRect()
            const x = e.clientX - rect.left
            const percentage = Math.min(100, Math.max(0, Math.round((x / rect.width) * 100)))

            updateSlider(percentage)
        }

        function drag(e) {
            if (!isDragging) return

            const rect = sliderContainer.getBoundingClientRect()
            const x = e.clientX - rect.left
            const percentage = Math.min(100, Math.max(0, Math.round((x / rect.width) * 100)))

            updateSlider(percentage)
        }

        function stopDrag() {
            isDragging = false
            document.removeEventListener("mousemove", drag)
            document.removeEventListener("mouseup", stopDrag)
        }

        function updateSlider(percentage) {
            currentValue = percentage
            sliderTrack.style.width = `${percentage}%`
            sliderThumb.style.left = `calc(${percentage}% - 20px)`
            valueDisplay.textContent = `${percentage}%`
            valueDisplay.style.left = `calc(${percentage}% - 10px)`
        }

        // Para dispositivos táctiles
        sliderThumb.addEventListener("touchstart", (e) => {
            e.preventDefault()
            isDragging = true
            document.addEventListener("touchmove", touchDrag)
            document.addEventListener("touchend", stopTouchDrag)
        })

        function touchDrag(e) {
            if (!isDragging) return

            const touch = e.touches[0]
            const rect = sliderContainer.getBoundingClientRect()
            const x = touch.clientX - rect.left
            const percentage = Math.min(100, Math.max(0, Math.round((x / rect.width) * 100)))

            updateSlider(percentage)
        }

        function stopTouchDrag() {
            isDragging = false
            document.removeEventListener("touchmove", touchDrag)
            document.removeEventListener("touchend", stopTouchDrag)
        }
    } else if (challengeType === 1) {
        // Desafío rompecabezas
        const puzzleContainer = document.createElement("div")
        puzzleContainer.className = "puzzle-container"

        const instructions = document.createElement("p")
        instructions.textContent = "Select all squares with numbers in ascending order:"

        container.appendChild(instructions)
        container.appendChild(puzzleContainer)

        // Generar puzzle
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        shuffleArray(numbers)

        challengeAnswer = [...numbers].sort((a, b) => a - b).slice(0, 3)

        for (let i = 0; i < 9; i++) {
            const piece = document.createElement("div")
            piece.className = "puzzle-piece"
            piece.textContent = numbers[i]
            piece.dataset.value = numbers[i]

            piece.addEventListener("click", () => {
                piece.classList.toggle("selected")
            })

            puzzleContainer.appendChild(piece)
        }
    } else if (challengeType === 2) {
        // Reto de selección de imágenes
        const imageContainer = document.createElement("div")
        imageContainer.className = "image-select"

        const instructions = document.createElement("p")

        // Definir los tipos de retos
        const challenges = [{
                instruction: "Select the image that shows a circle:",
                correct: 0
            },
            {
                instruction: "Select the image that shows a square:",
                correct: 1
            },
            {
                instruction: "Select the image that shows a triangle:",
                correct: 2
            },
            {
                instruction: "Select the image with the color red:",
                correct: 3
            },
        ]

        const selectedChallenge = challenges[randomInt(0, challenges.length - 1)]
        instructions.textContent = selectedChallenge.instruction
        challengeAnswer = selectedChallenge.correct

        container.appendChild(instructions)
        container.appendChild(imageContainer)

        // Crear imágenes en canva
        for (let i = 0; i < 4; i++) {
            const imageOption = document.createElement("div")
            imageOption.className = "image-option"
            imageOption.dataset.value = i

            const canvas = document.createElement("canvas")
            canvas.width = 100
            canvas.height = 70
            const ctx = canvas.getContext("2d")

            // Dibujar diferentes formas en función del índice
            ctx.fillStyle = i === 3 ? "#ef4444" : "#6366f1"

            if (i === 0) {
                // Círculo
                ctx.beginPath()
                ctx.arc(50, 35, 25, 0, Math.PI * 2)
                ctx.fill()
            } else if (i === 1) {
                // Cuadrado
                ctx.fillRect(25, 10, 50, 50)
            } else if (i === 2) {
                // Triángulo
                ctx.beginPath()
                ctx.moveTo(50, 10)
                ctx.lineTo(85, 60)
                ctx.lineTo(15, 60)
                ctx.closePath()
                ctx.fill()
            } else {
                // Rectángulo rojo
                ctx.fillRect(20, 15, 60, 40)
            }

            imageOption.appendChild(canvas)

            imageOption.addEventListener("click", () => {
                // Deseleccionar todas las opciones
                document.querySelectorAll(".image-option").forEach((opt) => {
                    opt.classList.remove("selected")
                })

                // Seleccione esta opción
                imageOption.classList.add("selected")
            })

            imageContainer.appendChild(imageOption)
        }
    }

    // Añadir espacio para el mensaje de error
    const errorEl = document.createElement("div")
    errorEl.id = "challenge-error"
    errorEl.className = "error-message hidden"
    errorEl.style.marginTop = "1rem"
    errorEl.style.marginBottom = "1rem"
    container.appendChild(errorEl)
}

// =========================================
// VERIFICATION PROCESS
// =========================================

// Modificar la función verifyCaptcha para registrar la verificación
function verifyCaptcha() {
    const input = document.getElementById("captcha-input")
    const errorEl = document.getElementById("captcha-error")

    if (!input || !errorEl) {
        console.error("Input or error element not found")
        return false
    }

    // Comprobar si la entrada está vacía
    if (!input.value.trim()) {
        errorEl.textContent = "Please enter the characters shown in the image."
        errorEl.classList.remove("hidden")
        return false
    }

    // Comparación sin distinción entre mayúsculas y minúsculas
    if (input.value.trim().toLowerCase() !== captchaText.toLowerCase()) {
        errorEl.textContent = "Incorrect. Please try again."
        errorEl.classList.remove("hidden")
        generateCaptcha()
        input.value = ""
        return false
    }

    errorEl.classList.add("hidden")

    // Registrar que el captcha ha sido verificado
    try {
        sessionStorage.setItem("captchaVerified", "true")
    } catch (e) {
        // Silent fail
    }

    return true
}

// Modificar la función verifyInteractiveChallenge para registrar la verificación
function verifyInteractiveChallenge() {
    const errorEl = document.getElementById("challenge-error")
    if (!errorEl) return false

    if (currentChallenge === 0) {
        // Slider challenge
        const sliderThumb = document.querySelector(".slider-thumb")
        if (!sliderThumb) return false

        const sliderContainer = document.querySelector(".slider-container")
        if (!sliderContainer) return false

        const rect = sliderContainer.getBoundingClientRect()
        const thumbRect = sliderThumb.getBoundingClientRect()

        const thumbCenter = thumbRect.left + thumbRect.width / 2 - rect.left
        const percentage = Math.round((thumbCenter / rect.width) * 100)

        // Permitir un margen de error del 10%.
        if (Math.abs(percentage - challengeAnswer) > 10) {
            errorEl.textContent = "Please move the slider closer to the target value."
            errorEl.classList.remove("hidden")
            return false
        }
    } else if (currentChallenge === 1) {
        // Rompecabezas
        const selectedPieces = document.querySelectorAll(".puzzle-piece.selected")

        if (selectedPieces.length !== 3) {
            errorEl.textContent = "Please select exactly 3 squares."
            errorEl.classList.remove("hidden")
            return false
        }

        const selectedValues = Array.from(selectedPieces).map((piece) => Number.parseInt(piece.dataset.value))
        selectedValues.sort((a, b) => a - b)

        // Comprobar si los valores seleccionados coinciden con la respuesta al reto
        const isCorrect = selectedValues.every((val, index) => val === challengeAnswer[index])

        if (!isCorrect) {
            errorEl.textContent = "Incorrect selection. Please try again."
            errorEl.classList.remove("hidden")
            return false
        }
    } else if (currentChallenge === 2) {
        // Reto de selección de imágenes
        const selectedImage = document.querySelector(".image-option.selected")

        if (!selectedImage) {
            errorEl.textContent = "Please select an image."
            errorEl.classList.remove("hidden")
            return false
        }

        const selectedValue = Number.parseInt(selectedImage.dataset.value)

        if (selectedValue !== challengeAnswer) {
            errorEl.textContent = "Incorrect selection. Please try again."
            errorEl.classList.remove("hidden")
            return false
        }
    }

    errorEl.classList.add("hidden")

    // Registrar que el desafío ha sido verificado
    try {
        sessionStorage.setItem("challengeVerified", "true")
    } catch (e) {
        // Silent fail
    }

    return true
}

function goToStep(step) {
    if (step === 2) {
        const captchaVerified = sessionStorage.getItem("captchaVerified") === "true"
        if (!captchaVerified) {
            console.error("Attempt to skip verification detected")
            window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            return
        }
    }

    document.querySelectorAll(".verification-step").forEach((el) => {
        el.classList.remove("active")
        el.classList.add("hidden")
    })

    const currentStep = document.getElementById(`step-${step}`)
    if (currentStep) {
        currentStep.classList.add("active")
        currentStep.classList.remove("hidden")
    }

    document.querySelectorAll(".step").forEach((el, index) => {
        el.classList.remove("active", "completed")

        if (index + 1 < step) {
            el.classList.add("completed")
        } else if (index + 1 === step) {
            el.classList.add("active")
        }
    })

    const progressLine = document.querySelector(".progress-line")
    if (progressLine) {
        if (step > 1) {
            progressLine.classList.add("completed")
        } else {
            progressLine.classList.remove("completed")
        }
    }

    if (step === 1) {
        setTimeout(() => {
            generateCaptcha()
        }, 100)
    } else if (step === 2) {
        generateInteractiveChallenge()
    }
}

function completeVerification() {
    document.querySelectorAll(".verification-step").forEach((el) => {
        el.classList.remove("active")
        el.classList.add("hidden")
    })

    const emailSection = document.getElementById("email-section")
    if (emailSection) {
        emailSection.classList.add("active")
        emailSection.classList.remove("hidden")
    }

    document.querySelectorAll(".step").forEach((el) => {
        el.classList.remove("active")
        el.classList.add("completed")
    })

    // Actualizar línea de progreso
    const progressLine = document.querySelector(".progress-line")
    if (progressLine) {
        progressLine.classList.add("completed")
    }

    // Mostrar el correo electrónico protegido
    displayProtectedEmail()

    // Guardar verificación en sessionStorage
    try {
        sessionStorage.setItem("verified", "true")
        sessionStorage.setItem("verifiedAt", Date.now().toString())
    } catch (e) {
        // Silent fail para navegación privada
    }
}

// Modificar la función displayProtectedEmail para usar un fondo gris oscuro en lugar del gradiente
function displayProtectedEmail() {
    const emailDisplay = document.getElementById("email-display")
    if (!emailDisplay) return

    const emailParts = ["f", "l", "2", "o", "n", "@", "e", "n", "g", "i", "n", "e", "e", "r", ".", "c", "o", "m"]

    // Limpiar el contenedor
    emailDisplay.innerHTML = ""

    // Cambiar a fondo gris oscuro en lugar del gradiente
    emailDisplay.style.background = "var(--card-bg)" // Usar el color de fondo de la tarjeta (gris oscuro)
    emailDisplay.style.color = "#ffffff"
    emailDisplay.style.position = "relative"
    emailDisplay.style.overflow = "hidden"
    emailDisplay.style.border = "1px solid rgba(255, 255, 255, 0.1)" // Añadir un borde sutil

    // Añadir el efecto de reflejo
    const reflection = document.createElement("div")
    reflection.style.position = "absolute"
    reflection.style.top = "0"
    reflection.style.left = "-100%"
    reflection.style.width = "50%"
    reflection.style.height = "100%"
    reflection.style.background =
        "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)"
    reflection.style.transform = "skewX(-25deg)"
    reflection.style.animation = "reflectionMove 3s ease-in-out infinite"
    emailDisplay.appendChild(reflection)

    // Añadir keyframes para la animación de reflejo
    if (!document.getElementById("reflection-animation")) {
        const style = document.createElement("style")
        style.id = "reflection-animation"
        style.textContent = `
      @keyframes reflectionMove {
        0% { left: -100%; }
        50% { left: 100%; }
        100% { left: 100%; }
      }
    `
        document.head.appendChild(style)
    }

    window._allowCopy = true

    emailParts.forEach((char, index) => {
        setTimeout(() => {
            const span = document.createElement("span")
            span.textContent = char
            span.style.opacity = "0"
            span.style.transform = "translateY(10px)"
            span.style.transition = "all 0.2s ease"
            span.style.textShadow = "0 0 5px rgba(255, 255, 255, 0.3)"

            emailDisplay.appendChild(span)

            // Animar la aparición
            setTimeout(() => {
                span.style.opacity = "1"
                span.style.transform = "translateY(0)"
            }, 50)
        }, index * 100)
    })
}

function copyEmailToClipboard() {
    const verified = sessionStorage.getItem("verified") === "true"
    if (!verified) {
        console.error("Unauthorized copy attempt")
        window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        return
    }

    const email = "fl2on@engineer.com"

    navigator.clipboard
        .writeText(email)
        .then(() => {
            const message = document.getElementById("copied-message")
            if (message) {
                message.classList.add("show")

                setTimeout(() => {
                    message.classList.remove("show")
                }, 2000)
            }
        })
        .catch((err) => {
            console.error("Could not copy email: ", err)
            alert("Email copied to clipboard!")
        })
}

// Añadir función para detectar Tor y sitios de visualización de código fuente
function setupAdvancedProtection() {
    // Detección de Tor - Hacerla menos agresiva
    function detectTor() {
        // Comprobar si el usuario está usando Tor
        const userAgent = navigator.userAgent.toLowerCase()

        // Solo detectar si explícitamente menciona Tor
        if (userAgent.includes("tor") && userAgent.includes("browser")) {
            return true
        }

        return false
    }

    function detectSourceCodeViewers() {
        const sourceCodeViewers = [
            "view-source:",
            "raw.githubusercontent",
            "archive.org/web/",
            "webcache.googleusercontent",
            "htmlpreview.github.io",
        ]

        const currentUrl = window.location.href.toLowerCase()
        return sourceCodeViewers.some((domain) => currentUrl.includes(domain))
    }

    if (detectTor() || detectSourceCodeViewers()) {
        window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    }

    if (window.self !== window.top) {
        window.top.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    }
}

function detectSpamReload() {
    try {
        // Obtener el número de recargas en la última hora
        const now = Date.now()
        const reloads = JSON.parse(localStorage.getItem("_page_reloads") || "[]")

        // Filtrar recargas en la última hora
        const recentReloads = reloads.filter((time) => now - time < 3600000)

        // Añadir la recarga actual
        recentReloads.push(now)

        // Guardar las recargas actualizadas
        localStorage.setItem("_page_reloads", JSON.stringify(recentReloads))

        // Si hay más de 20 recargas en la última hora, considerar spam
        if (recentReloads.length > 20) {
            return true
        }

        return false
    } catch (e) {
        // Si hay un error (por ejemplo, localStorage no disponible), no detectar como spam
        return false
    }
}

// Modificar la función initApp para incluir la protección avanzada
function initApp() {
    // Marcar que la app se ha inicializado
    window._appInitialized = true

    console.log("Initializing application...")

    // Establecer el contexto seguro para las funciones protegidas
    window._secureContext = true

    // Configurar protección avanzada (Tor, view source, etc.)
    setupAdvancedProtection()

    // Detectar spam reload - Usar la función restaurada
    if (detectSpamReload()) {
        console.error("Spam reload detected")
        redirectToTroll("spam_reload")
        return
    }

    // Configurar protección de imágenes
    const setupImageProtection = () => {
        // Implement your image protection logic here
    }

    setupImageProtection()

    // Configurar protección anti-cloning
    setupAntiCloningProtection()

    // Configurar protección anti-devtools
    setupDevToolsProtection()

    // Remover preloader después de un breve retraso para mostrar la animación
    setTimeout(() => {
        const preloader = document.querySelector(".preloader")
        if (preloader) {
            console.log("Removing preloader...")
            preloader.style.opacity = "0"
            preloader.style.visibility = "hidden"

            // Eliminar completamente después de la transición
            setTimeout(() => {
                preloader.style.display = "none"
            }, 500)
        }
    }, 1000)

    // Crear partículas de fondo
    const createParticles = () => {
        const particleCount = 20

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement("div")
            particle.className = "particle"

            // Posición aleatoria
            particle.style.left = `${Math.random() * 100}vw`
            particle.style.top = `${Math.random() * 100}vh`

            // Tamaño aleatorio
            const size = Math.random() * 6 + 2
            particle.style.width = `${size}px`
            particle.style.height = `${size}px`

            // Opacidad aleatoria
            particle.style.opacity = `${Math.random() * 0.5 + 0.1}`

            // Color aleatorio entre primary y secondary
            const colors = ["#6366f1", "#8b5cf6", "#4f46e5"]
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]

            // Animación con retraso aleatorio
            particle.style.animationDelay = `${Math.random() * 5}s`
            particle.style.animationDuration = `${Math.random() * 10 + 10}s`

            document.body.appendChild(particle)
        }
    }

    createParticles()

    // Limpiar cualquier verificación anterior
    try {
        sessionStorage.removeItem("captchaVerified")
        sessionStorage.removeItem("challengeVerified")
    } catch (e) {}

    try {
        const verified = sessionStorage.getItem("verified")
        const verifiedAt = sessionStorage.getItem("verifiedAt")

        if (verified === "true" && verifiedAt && Date.now() - Number.parseInt(verifiedAt) < 3600000) {
            // Establecer las verificaciones como completadas
            sessionStorage.setItem("captchaVerified", "true")
            sessionStorage.setItem("challengeVerified", "true")
            completeVerification()
            return
        }
    } catch (e) {}

    const timestampField = document.getElementById("timestamp")
    if (timestampField) {
        timestampField.value = Date.now().toString()
    }

    goToStep(1)

    setTimeout(() => {
        generateCaptcha()
    }, 300)

    // Receptores de eventos de botones
    const refreshCaptchaBtn = document.getElementById("refresh-captcha")
    if (refreshCaptchaBtn) {
        refreshCaptchaBtn.addEventListener("click", generateCaptcha)
    }

    const step1SubmitBtn = document.getElementById("step-1-submit")
    if (step1SubmitBtn) {
        step1SubmitBtn.addEventListener("click", () => {
            if (verifyCaptcha()) {
                goToStep(2)
            }
        })
    }

    const step2SubmitBtn = document.getElementById("step-2-submit")
    if (step2SubmitBtn) {
        step2SubmitBtn.addEventListener("click", () => {
            if (verifyInteractiveChallenge()) {
                completeVerification()
            }
        })
    }

    const copyClipboardBtn = document.getElementById("copy-to-clipboard")
    if (copyClipboardBtn) {
        copyClipboardBtn.addEventListener("click", copyEmailToClipboard)
    }

    const captchaInput = document.getElementById("captcha-input")
    if (captchaInput) {
        captchaInput.addEventListener("input", () => {
            const captchaError = document.getElementById("captcha-error")
            if (captchaError) {
                captchaError.classList.add("hidden")
            }
        })
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const step1 = document.getElementById("step-1")
            const step2 = document.getElementById("step-2")

            if (step1 && step1.classList.contains("active")) {
                const step1SubmitBtn = document.getElementById("step-1-submit")
                if (step1SubmitBtn) step1SubmitBtn.click()
            } else if (step2 && step2.classList.contains("active")) {
                const step2SubmitBtn = document.getElementById("step-2-submit")
                if (step2SubmitBtn) step2SubmitBtn.click()
            }
        }
    })

    // Protección adicional contra automatización
    // Verificar que el usuario mueva el ratón
    let hasMouseMoved = false
    document.addEventListener("mousemove", () => {
        hasMouseMoved = true
    })

    // Verificar después de un tiempo que haya habido interacción humana
    setTimeout(() => {
        if (!hasMouseMoved) {
            console.error("No human interaction detected")
            document.body.innerHTML = "<h1>Bot detected</h1>"
        }
    }, 5000)

    console.log("Application initialized")
}

// Asegurar que la aplicación se inicializa correctamente
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded, initializing app...")
    initApp()
})

// Añadir una carga de respaldo en caso de que algo falle
window.addEventListener("load", () => {
    console.log("Window loaded, checking if preloader is still visible...")
    // Si después de 3 segundos el preloader sigue visible, forzar su eliminación
    setTimeout(() => {
        const preloader = document.querySelector(".preloader")
        if (preloader && (preloader.style.display !== "none" || preloader.style.opacity !== "0")) {
            console.log("Forcing preloader removal...")
            preloader.style.opacity = "0"
            preloader.style.visibility = "hidden"
            setTimeout(() => {
                preloader.style.display = "none"
            }, 500)

            // Iniciar la aplicación si no se ha iniciado
            if (!window._appInitialized) {
                initApp()
            }
        }
    }, 3000)
})
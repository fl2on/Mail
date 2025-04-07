// =========================================
// ANTI-BOT & ANTI-CLONING PROTECTION
// =========================================

/**
 * Configuration for the bot detection system
 */
const botDetectionConfig = {
  minHumanMouseMovements: 1,
  maxSuspiciousScore: 30,
  maxVerificationAttempts: 5,
  honeypotFieldIds: ["website"],
}

/**
 * Bot detection score - higher means more likely to be a bot
 */
let botScore = 0

/**
 * Store the first time the user interacts with the page
 */
const firstInteractionTime = null

/**
 * Capture mouse movements to detect automation
 */
let mouseMovements = 0
let lastMousePosition = { x: 0, y: 0 }

document.addEventListener("mousemove", (e) => {
  mouseMovements++
  lastMousePosition = { x: e.clientX, y: e.clientY }
})

/**
 * Check if honeypot field is filled (bots often fill all fields)
 */
function checkHoneypot() {
  const honeypot = document.getElementById("website")
  return honeypot && honeypot.value.length > 0
}

/**
 * Anti-cloning protection
 */
function setupAntiCloningProtection() {
  // Generar un token único para esta sesión
  const sessionToken = Date.now().toString(36) + Math.random().toString(36).substring(2)

  // Almacenar en sessionStorage
  try {
    sessionStorage.setItem("_auth_token", sessionToken)
  } catch (e) {
    // Silent fail para navegación privada
  }

  // Verificar periódicamente si la página ha sido clonada
  setInterval(() => {
    try {
      if (sessionStorage.getItem("_auth_token") !== sessionToken) {
        showSessionInvalidMessage()
      }
    } catch (e) {
      // Silent fail
    }
  }, 2000)

  // Verificar si está siendo ejecutado en un iframe
  if (window.self !== window.top) {
    showSessionInvalidMessage("This page cannot be displayed in an iframe")
  }

  // Verificar si está siendo ejecutado en same.dev o similares
  if (
    window.location.hostname.includes("same.dev") ||
    window.location.hostname.includes("replit") ||
    window.location.hostname.includes("glitch.me") ||
    window.location.hostname.includes("codepen.io")
  ) {
    showSessionInvalidMessage("Access denied: This page cannot be viewed on this platform")
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
    window.location.reload()
  })

  // Añadir elementos al contenedor
  sessionInvalid.appendChild(icon)
  sessionInvalid.appendChild(title)
  sessionInvalid.appendChild(message)
  sessionInvalid.appendChild(button)

  // Añadir al body
  document.body.appendChild(sessionInvalid)
}

// =========================================
// ANTI-DEVTOOLS PROTECTION
// =========================================

/**
 * Detecta si las herramientas de desarrollador están abiertas
 */
function setupDevToolsProtection() {
  // Método 1: Detección por cambio de tamaño de la ventana
  let devtoolsOpen = false
  const threshold = 160 // Umbral para detectar la apertura de devtools

  // Función para verificar si las devtools están abiertas
  function checkDevTools() {
    // Método 1: Detección por diferencia entre ventana interna y externa
    const widthThreshold = window.outerWidth - window.innerWidth > threshold
    const heightThreshold = window.outerHeight - window.innerHeight > threshold

    // Método 2: Detección por función de depuración
    let isDebuggerEnabled = false
    const startTime = new Date().getTime()

    function debuggerCheck() {
      // Esta función se ralentizará si hay un depurador activo
      debugger
      const endTime = new Date().getTime()
      isDebuggerEnabled = endTime - startTime > 100
    }

    try {
      debuggerCheck()
    } catch (e) {}

    // Método 3: Detección por console.log
    const consoleCheck = /./
    consoleCheck.toString = () => {
      devtoolsOpen = true
      return "console check"
    }

    // Si las devtools están abiertas por cualquier método
    if (widthThreshold || heightThreshold || isDebuggerEnabled || devtoolsOpen) {
      if (!devtoolsOpen) {
        devtoolsOpen = true
        hideRealCode()
      }
    } else {
      if (devtoolsOpen) {
        devtoolsOpen = false
        restoreRealCode()
      }
    }

    // Limpiar la detección de console.log
    devtoolsOpen = false
  }

  // Verificar periódicamente
  setInterval(checkDevTools, 1000)

  // También verificar en cambios de tamaño de ventana
  window.addEventListener("resize", checkDevTools)

  // Método 4: Detección por tiempo de ejecución
  setInterval(() => {
    const start = performance.now()
    debugger
    const end = performance.now()

    if (end - start > 100) {
      hideRealCode()
    }
  }, 1000)

  // Método 5: Detección por propiedades específicas de devtools
  setInterval(() => {
    if (window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) {
      hideRealCode()
    }

    if (window.outerHeight - window.innerHeight > threshold || window.outerWidth - window.innerWidth > threshold) {
      hideRealCode()
    }

    // Detección para Chrome
    const element = new Image()
    Object.defineProperty(element, "id", {
      get: () => {
        hideRealCode()
      },
    })
    console.log(element)
  }, 1000)
}

/**
 * Hide Code
 */
function hideRealCode() {
  if (!window._originalCode) {
    window._originalCode = {
      body: document.body.innerHTML,
      scripts: Array.from(document.scripts).map((script) => ({
        src: script.src,
        content: script.innerHTML,
      })),
    }

    Array.from(document.scripts).forEach((script) => {
      if (!script.src) {
        script.innerHTML = "// No code available"
      }
    })

    const fakeScript = document.createElement("script")
    fakeScript.innerHTML = `
      // This website is protected against inspection
      console.log('Security system active');
      
      function initSystem() {
        // Empty initialization
        return true;
      }
      
      // Basic configuration
      const config = {
        version: '1.0.0',
        debug: false,
        environment: 'production'
      };
      
      document.addEventListener('DOMContentLoaded', initSystem);
    `
    document.head.appendChild(fakeScript)

    document.querySelectorAll(".captcha-container, #interactive-challenge").forEach((el) => {
      if (el) el.style.visibility = "hidden"
    })

    console.clear()
    console.log("%c⚠️ Security Alert", "font-size:24px; color:red; font-weight:bold")
    console.log("%cThis website is protected against inspection and tampering.", "font-size:16px; color:red;")
    console.log(
      "%cAny attempt to modify or extract code may result in session termination.",
      "font-size:14px; color:orange;",
    )
  }
}

/**
 * Restaura el código original si es necesario
 */
function restoreRealCode() {
  if (window._originalCode) {
    window.location.reload()
  }
}

// =========================================
// UTILITY FUNCTIONS
// =========================================

/**
 * DOM element selector
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
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

/**
 * Generates Particles
 */
function createParticles() {
  const particleCount = 20

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div")
    particle.className = "particle"

    particle.style.left = `${Math.random() * 100}vw`
    particle.style.top = `${Math.random() * 100}vh`

    const size = Math.random() * 6 + 2
    particle.style.width = `${size}px`
    particle.style.height = `${size}px`

    particle.style.opacity = `${Math.random() * 0.5 + 0.1}`

    const colors = ["#6366f1", "#8b5cf6", "#4f46e5"]
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]

    particle.style.animationDelay = `${Math.random() * 5}s`
    particle.style.animationDuration = `${Math.random() * 10 + 10}s`

    document.body.appendChild(particle)
  }
}

// =========================================
// ADVANCED CAPTCHA GENERATOR
// =========================================

let captchaText = ""
let captchaRotation = 0

function generateAdvancedCaptcha() {
  const canvas = $("#captcha-canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) return

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Eliminados caracteres ambiguos
  captchaText = ""

  for (let i = 0; i < 3; i++) {
    captchaText += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  canvas.width = 180
  canvas.height = 70

  // Decide captcha type (0: normal, 1: rotated, 2: wavy)
  const captchaType = randomInt(0, 2)

  // Set background with gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
  gradient.addColorStop(0, "#4338ca")
  gradient.addColorStop(1, "#6366f1")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < 50; i++) {
    // Reducido de 100 a 50
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.15})` // Reducida la opacidad
    ctx.beginPath()
    ctx.arc(randomInt(0, canvas.width), randomInt(0, canvas.height), randomInt(1, 2), 0, Math.PI * 2)
    ctx.fill()
  }

  for (let i = 0; i < 2; i++) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`
    ctx.lineWidth = 1
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

  // Handle different captcha types
  if (captchaType === 1) {
    // Rotated captcha
    captchaRotation = randomInt(-30, 30)

    // Save context state
    ctx.save()

    // Translate to center, rotate, and translate back
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((captchaRotation * Math.PI) / 180)
    ctx.translate(-canvas.width / 2, -canvas.height / 2)

    // Draw captcha text
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 28px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(captchaText, canvas.width / 2, canvas.height / 2)

    // Restore context state
    ctx.restore()
  } else if (captchaType === 2) {
    // Wavy captcha
    captchaRotation = 0

    // Draw each character with wave effect
    const startX = 25
    const charWidth = 40 

    ctx.font = "bold 28px Arial"

    for (let i = 0; i < captchaText.length; i++) {
      const char = captchaText[i]
      const x = startX + i * charWidth 
      const y = canvas.height / 2 + Math.sin(i * 0.5) * 10

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate((Math.sin(i) * Math.PI) / 20)
      ctx.fillStyle = "#ffffff"
      ctx.fillText(char, 0, 0)
      ctx.restore()
    }
  } else {
    // Normal captcha with distorted characters
    captchaRotation = 0

    // Draw each character with individual distortion
    for (let i = 0; i < captchaText.length; i++) {
      ctx.save()

      const x = 25 + i * 45
      const y = canvas.height / 2 + randomInt(-5, 5)

      ctx.translate(x, y)
      ctx.rotate((randomInt(-15, 15) * Math.PI) / 180)

      // Add shadow for depth
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2

      // Random text color variations
      ctx.fillStyle = "#ffffff"
      ctx.font = `bold ${randomInt(26, 32)}px Arial`
      ctx.fillText(captchaText[i], 0, 0)

      ctx.restore()
    }
  }

  // Add a subtle border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
  ctx.lineWidth = 1
  ctx.strokeRect(0, 0, canvas.width, canvas.height)

  return captchaType
}

// =========================================
// INTERACTIVE CHALLENGES
// =========================================

let currentChallenge = null
let challengeAnswer = null

function generateInteractiveChallenge() {
  const container = $("#interactive-challenge")
  container.innerHTML = ""

  // Choose a random challenge type
  const challengeType = randomInt(0, 2)
  currentChallenge = challengeType

  if (challengeType === 0) {
    // Slider challenge
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

    // For touch devices
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
    // Puzzle challenge
    const puzzleContainer = document.createElement("div")
    puzzleContainer.className = "puzzle-container"

    const instructions = document.createElement("p")
    instructions.textContent = "Select all squares with numbers in ascending order:"

    container.appendChild(instructions)
    container.appendChild(puzzleContainer)

    // Generate puzzle
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
    // Image selection challenge
    const imageContainer = document.createElement("div")
    imageContainer.className = "image-select"

    const instructions = document.createElement("p")

    // Define challenge types
    const challenges = [
      { instruction: "Select the image that shows a circle:", correct: 0 },
      { instruction: "Select the image that shows a square:", correct: 1 },
      { instruction: "Select the image that shows a triangle:", correct: 2 },
      { instruction: "Select the image with the color red:", correct: 3 },
    ]

    const selectedChallenge = challenges[randomInt(0, challenges.length - 1)]
    instructions.textContent = selectedChallenge.instruction
    challengeAnswer = selectedChallenge.correct

    container.appendChild(instructions)
    container.appendChild(imageContainer)

    // Create canvas images
    for (let i = 0; i < 4; i++) {
      const imageOption = document.createElement("div")
      imageOption.className = "image-option"
      imageOption.dataset.value = i

      const canvas = document.createElement("canvas")
      canvas.width = 100
      canvas.height = 70
      const ctx = canvas.getContext("2d")

      // Draw different shapes based on index
      ctx.fillStyle = i === 3 ? "#ef4444" : "#6366f1"

      if (i === 0) {
        // Circle
        ctx.beginPath()
        ctx.arc(50, 35, 25, 0, Math.PI * 2)
        ctx.fill()
      } else if (i === 1) {
        // Square
        ctx.fillRect(25, 10, 50, 50)
      } else if (i === 2) {
        // Triangle
        ctx.beginPath()
        ctx.moveTo(50, 10)
        ctx.lineTo(85, 60)
        ctx.lineTo(15, 60)
        ctx.closePath()
        ctx.fill()
      } else {
        // Red rectangle
        ctx.fillRect(20, 15, 60, 40)
      }

      imageOption.appendChild(canvas)

      imageOption.addEventListener("click", () => {
        // Deselect all options
        document.querySelectorAll(".image-option").forEach((opt) => {
          opt.classList.remove("selected")
        })

        // Select this option
        imageOption.classList.add("selected")
      })

      imageContainer.appendChild(imageOption)
    }
  }
}

// =========================================
// VERIFICATION PROCESS
// =========================================

function verifyCaptcha() {
  const input = $("#captcha-input")
  const errorEl = $("#captcha-error")

  // Check if honeypot field is filled (bot detection)
  if (checkHoneypot()) {
    errorEl.textContent = "Verification failed. Please try again."
    errorEl.classList.remove("hidden")
    botScore += 10
    return false
  }

  // Check if input is empty
  if (!input.value.trim()) {
    errorEl.textContent = "Please enter the characters shown in the image."
    errorEl.classList.remove("hidden")
    return false
  }

  // For rotated captchas, we need to be more lenient
  if (captchaRotation !== 0) {
    // Case insensitive comparison for rotated captchas
    if (input.value.trim().toLowerCase() !== captchaText.toLowerCase()) {
      errorEl.textContent = "Incorrect. Please try again."
      errorEl.classList.remove("hidden")
      generateAdvancedCaptcha()
      input.value = ""
      return false
    }
  } else {
    // For normal captchas, we can be more strict but still case insensitive
    if (input.value.trim().toLowerCase() !== captchaText.toLowerCase()) {
      errorEl.textContent = "Incorrect. Please try again."
      errorEl.classList.remove("hidden")
      generateAdvancedCaptcha()
      input.value = ""
      return false
    }
  }

  errorEl.classList.add("hidden")
  return true
}

function verifyInteractiveChallenge() {
  const errorEl = $("#challenge-error")

  if (currentChallenge === 0) {
    // Slider challenge
    const sliderThumb = $(".slider-thumb")
    if (!sliderThumb) return false

    const sliderContainer = $(".slider-container")
    const rect = sliderContainer.getBoundingClientRect()
    const thumbRect = sliderThumb.getBoundingClientRect()

    const thumbCenter = thumbRect.left + thumbRect.width / 2 - rect.left
    const percentage = Math.round((thumbCenter / rect.width) * 100)

    // Aumentar el margen de error a 10%
    if (Math.abs(percentage - challengeAnswer) > 10) {
      errorEl.textContent = "Please move the slider closer to the target value."
      errorEl.classList.remove("hidden")
      return false
    }
  } else if (currentChallenge === 1) {
    // Puzzle challenge
    const selectedPieces = document.querySelectorAll(".puzzle-piece.selected")

    if (selectedPieces.length !== 3) {
      errorEl.textContent = "Please select exactly 3 squares."
      errorEl.classList.remove("hidden")
      return false
    }

    const selectedValues = Array.from(selectedPieces).map((piece) => Number.parseInt(piece.dataset.value))
    selectedValues.sort((a, b) => a - b)

    // Check if selected values match challenge answer
    const isCorrect = selectedValues.every((val, index) => val === challengeAnswer[index])

    if (!isCorrect) {
      errorEl.textContent = "Incorrect selection. Please try again."
      errorEl.classList.remove("hidden")
      return false
    }
  } else if (currentChallenge === 2) {
    // Image selection challenge
    const selectedImage = $(".image-option.selected")

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
  return true
}

function goToStep(step) {
  // Hide all steps
  document.querySelectorAll(".verification-step").forEach((el) => {
    el.classList.remove("active")
  })

  // Show current step
  $(`#step-${step}`).classList.add("active")

  // Update progress indicators
  document.querySelectorAll(".step").forEach((el, index) => {
    el.classList.remove("active", "completed")

    if (index + 1 < step) {
      el.classList.add("completed")
    } else if (index + 1 === step) {
      el.classList.add("active")
    }
  })

  // Update progress line
  if (step > 1) {
    $(".progress-line").classList.add("completed")
  } else {
    $(".progress-line").classList.remove("completed")
  }

  // Initialize the current step's verification method
  if (step === 1) {
    generateAdvancedCaptcha()
  } else if (step === 2) {
    generateInteractiveChallenge()
  }
}

function completeVerification() {
  // Hide verification section and show email
  $("#step-1").classList.remove("active")
  $("#step-2").classList.remove("active")
  $("#email-section").classList.add("active")

  // Update progress indicators
  document.querySelectorAll(".step").forEach((el) => {
    el.classList.add("completed")
  })

  $(".progress-line").classList.add("completed")

  // Set email with anti-scraping protection
  const email = "fl2on@engineer.com"
  displayProtectedEmail(email)

  // Save verification status in sessionStorage
  try {
    sessionStorage.setItem("verified", "true")
    sessionStorage.setItem("verifiedAt", Date.now().toString())
  } catch (e) {
    // Silent fail for private browsing
  }
}

// =========================================
// EMAIL PROTECTION & DISPLAY
// =========================================

function displayProtectedEmail(email) {
  const emailDisplay = $("#email-display")
  emailDisplay.innerHTML = ""

  // Create obfuscated email by reversing characters and using CSS
  for (const char of [...email]) {
    const span = document.createElement("span")
    span.className = "email-char"
    span.textContent = char

    // Add extra protection with data scrambling
    const decoyChar = String.fromCharCode(char.charCodeAt(0) + randomInt(1, 5))
    span.setAttribute("data-char", decoyChar)

    emailDisplay.appendChild(span)
  }
}

function copyEmailToClipboard() {
  const email = "fl2on@engineer.com"

  navigator.clipboard
    .writeText(email)
    .then(() => {
      // Show copied message
      const message = $("#copied-message")
      message.classList.add("show")

      // Hide after 2 seconds
      setTimeout(() => {
        message.classList.remove("show")
      }, 2000)
    })
    .catch((err) => {
      console.error("Could not copy email: ", err)
    })
}

// =========================================
// INIT & EVENT LISTENERS
// =========================================

function initApp() {
  // Setup anti-cloning protection
  setupAntiCloningProtection()

  // Setup anti-devtools protection
  setupDevToolsProtection()

  // Crear partículas de fondo
  createParticles()

  // Check if already verified (from session storage)
  try {
    const verified = sessionStorage.getItem("verified")
    const verifiedAt = sessionStorage.getItem("verifiedAt")

    // If verified within the last hour (3600000 ms)
    if (verified === "true" && verifiedAt && Date.now() - Number.parseInt(verifiedAt) < 3600000) {
      completeVerification()
      return
    }
  } catch (e) {
    // Silent fail for private browsing
  }

  // Add preloader
  window.addEventListener("load", () => {
    setTimeout(() => {
      const preloader = document.querySelector(".preloader")
      if (preloader) {
        preloader.classList.add("fade-out")
      }
    }, 800)
  })

  // Set timestamp in hidden field
  const timestampField = document.getElementById("timestamp")
  if (timestampField) {
    timestampField.value = Date.now().toString()
  }

  // Initialize first verification step
  goToStep(1)

  // Button event listeners
  $("#refresh-captcha").addEventListener("click", generateAdvancedCaptcha)

  $("#step-1-submit").addEventListener("click", () => {
    if (verifyCaptcha()) {
      goToStep(2)
    }
  })

  $("#step-2-submit").addEventListener("click", () => {
    if (verifyInteractiveChallenge()) {
      completeVerification()
    }
  })

  $("#copy-to-clipboard").addEventListener("click", copyEmailToClipboard)

  // Input validation & real-time monitoring
  const captchaInput = $("#captcha-input")
  captchaInput.addEventListener("input", () => {
    // Clear error message when typing
    $("#captcha-error").classList.add("hidden")
  })

  // Keyboard shortcut for submitting
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const step1 = $("#step-1")
      const step2 = $("#step-2")

      if (step1.classList.contains("active")) {
        $("#step-1-submit").click()
      } else if (step2.classList.contains("active")) {
        $("#step-2-submit").click()
      }
    }
  })
}

// Initialize the application
document.addEventListener("DOMContentLoaded", initApp)
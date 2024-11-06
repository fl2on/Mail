const questionElement = document.getElementById("question");
const form = document.getElementById("form");
const emailSection = document.getElementById("email-section");

// Array de preguntas y respuestas
const questions = [
  { question: "What is the capital of France?", answer: "Paris" },
  { question: "What is the color of the sky?", answer: "Blue" },
  { question: "What is 2 + 2?", answer: "4" },
  { question: "Who painted the Mona Lisa?", answer: "Leonardo da Vinci" },
  { question: "What is the largest planet in our solar system?", answer: "Jupiter" },
  { question: "What is the chemical symbol for gold?", answer: "Au" },
  { question: "What is the main language spoken in Brazil?", answer: "Portuguese" },
  { question: "Who discovered gravity?", answer: "Isaac Newton" },
  { question: "What is the symbol for the element oxygen?", answer: "O" },
  { question: "What is the largest ocean on Earth?", answer: "Pacific Ocean" },
  { question: "Which planet is known as the Red Planet?", answer: "Mars" },
  { question: "What is the symbol for the element hydrogen?", answer: "H" }
];

let randomQuestion = getRandomQuestion();

// Muestra la pregunta en el elemento "question"
questionElement.textContent = randomQuestion.question;

// Función para verificar la respuesta
function verifyAnswer(event) {
  event.preventDefault();

  const answerInput = document.getElementById("answer");
  const emailAddressElement = document.getElementById("email-address");

  const userAnswer = answerInput.value.trim().toLowerCase();
  const correctAnswer = randomQuestion.answer.toLowerCase();

  if (userAnswer === correctAnswer) {
    // Respuesta correcta
    const email = generateEmail("fl2on", "engineer.com");
    const mailtoLink = generateMailtoLink(email);
    displayEmailAddress(email, mailtoLink);

    // Animación de aparición de la sección de correo electrónico
    fadeIn(emailSection);

    // Animación de desaparición del formulario
    fadeOut(form);
  } else {
    // Respuesta incorrecta
    showAlert("Incorrect answer. Please try again.");
    answerInput.value = "";
  }
}

form.addEventListener("submit", verifyAnswer);

function copyToClipboard() {
  const copyText = document.getElementById("email-address");
  navigator.clipboard.writeText(copyText.textContent);

  // Animación de notificación de copiado al portapapeles
  const toast = createToast("Copied to clipboard!");
  document.body.appendChild(toast);

  // Desaparecer la notificación después de 3 segundos
  setTimeout(() => {
    fadeOut(toast, () => {
      toast.remove();
    });
  }, 3000);
}

function getRandomQuestion() {
  return questions[Math.floor(Math.random() * questions.length)];
}

function displayEmailAddress(email, mailtoLink) {
  const emailAddressElement = document.getElementById("email-address");
  emailAddressElement.setAttribute("href", mailtoLink);
  emailAddressElement.textContent = email;
}

function fadeIn(element) {
  element.style.opacity = 0;
  element.style.display = "block";
  setTimeout(() => {
    element.style.opacity = 1;
  }, 300);
}

function fadeOut(element, callback) {
  element.style.opacity = 1;
  element.style.pointerEvents = "none";
  element.style.transform = "translateY(-10px)";
  setTimeout(() => {
    element.style.opacity = 0;
    element.style.display = "none";
    if (typeof callback === "function") {
      callback();
    }
  }, 300);
}

function showAlert(message) {
  alert(message);
}

function createToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = message;
  return toast;
}

function generateEmail(username, domain) {
  return `${username}@${domain}`;
}

function generateMailtoLink(email) {
  return `mailto:${email}`;
}

window.onload = function() {
  var year = new Date().getFullYear();
  document.querySelector('footer p').textContent = '© ' + year + ' fl2on. All rights reserved.';
}

// Cambia la pregunta al cambiar de pestaña
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible") {
    randomQuestion = getRandomQuestion();
    questionElement.textContent = randomQuestion.question;
  }
});

// Cambia la pregunta antes de recargar la página
window.addEventListener("beforeunload", function (event) {
  randomQuestion = getRandomQuestion();
  questionElement.textContent = randomQuestion.question;
});

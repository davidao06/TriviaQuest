const questions = document.getElementById("Perguntas");
const buttonQuestion = document.getElementById("randomButton");
const respostas = document.getElementById("Respostas");

let fetchQuestions = [];
let totalQuestion = 10;
let atualQuestion = undefined;
let respondidas = 0;
let certas = 0;
let erradas = 0;
let segundos = 10;
let intervalID = undefined;

const initializeTrivia = async () => {
    buttonQuestion.disabled = true;
    fetchQuestions = await getQuestions();

    getNextQuestion();
}

const getQuestions = async () => {
    const data = await fetch(`https://the-trivia-api.com/api/questions?limit=${totalQuestion}`);

    return data.json();
}
    
const getNextQuestion = () => {
    if (respondidas < totalQuestion) {
        atualQuestion = fetchQuestions[respondidas];
        respondidas++;
        displayQuestion();
        segundos = 0;
        intervalID = setInterval(frame,1000);
        function frame () {
            segundos++;
            if (segundos > 10) {
                wrongAnswer();
            }
        }
    }
    else {
        questions.innerHTML = `<b>Já respondeu a todas as questões!</b>`;
        respostas.innerHTML = `Resultado final -> ${certas} respostas certas e ${erradas} respostas erradas`;
    }
}

buttonQuestion.addEventListener("click",initializeTrivia);

const displayQuestion = () => {
    questions.innerHTML = `<div class="categoria"><b>Categoria -> ${atualQuestion["category"]} </b></div>
    <div class="pergunta"><p>${atualQuestion["question"]} </p></div>`;
    let answers = [];
    answers.push(atualQuestion["correctAnswer"]);
    answers = answers.concat(atualQuestion["incorrectAnswers"]);
    answers.sort();
    respostas.innerHTML = "";
    for (res in answers) {
        let botao = document.createElement("button");
        botao.innerText = answers[res];
        botao.classList.add("answerButton");
        if (answers[res] === atualQuestion["correctAnswer"]) {
            botao.onclick = rightAnswer;
        }
        else botao.onclick = wrongAnswer;
        respostas.appendChild(botao);
    }
}

const rightAnswer = () => {
    certas++;
    clearInterval(intervalID);
    respostas.innerHTML = `<div class="correta">Resposta correta. Parabéns!</div>`;
    setTimeout(()=> {
        getNextQuestion();
    },2000);
}

const wrongAnswer = () => {
    erradas++;
    clearInterval(intervalID);
    respostas.innerHTML = `<div class="incorreta">Resposta incorreta. A resposta correta era ${atualQuestion["correctAnswer"]}.</div>`;
    setTimeout(()=> {
        getNextQuestion();
    },2000);
}

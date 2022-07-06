const perguntas = document.createElement("div");
const buttonQuestion = document.getElementById("randomButton");
const respostas = document.createElement("div");
respostas.classList.add("respostasContainer");
perguntas.classList.add("perguntasContainer");



const categorias = document.getElementById("categoriaChoice");

let fetchQuestions = [];
let totalQuestion = 10;
let categoria = undefined;
let indexCorreta = 0;
let timeQuestion = 10;
let atualQuestion = undefined;
let respondidas = 0;
let certas = 0;
let erradas = 0;
let segundos = 10;
let intervalID = undefined;
let barraTimer = undefined;

const getListCategorias = async () => {
    const list = await fetch("https://the-trivia-api.com/api/categories");
    return list.json();
}

async function buildListCategorias () {
    let listCategorias = await getListCategorias();

    let select = document.querySelector("#lang");
    let all = document.createElement("option");
    all.setAttribute("value","all");
    all.innerText = "Every category";
    select.appendChild(all);

    for(let x in listCategorias) {
        let opcao = document.createElement("option");
        opcao.setAttribute("value",x);
        opcao.innerText = x;
        select.appendChild(opcao);
    }
    
}

buildListCategorias();

const initializeTrivia = async () => {
    let select = document.getElementById("lang");
    categoria = select.options[select.selectedIndex].value;

    categoria = categoria.replace(/ /g,"_");
    categoria = categoria.replace(/&/g,"and");
    categoria = categoria.toLowerCase();

    let numero = document.querySelector('input[name="numeroQuestoes"]:checked');
    let tempo = document.querySelector('input[name="tempoQuestao"]:checked');

    if (numero == null || tempo == null) {
        document.querySelector("#missingWarning").style.display = "block";

        
        setTimeout(() => {
            document.querySelector("#missingWarning").style.display = "none";
        },3000);
    }
    else {
        totalQuestion = numero.value;
        timeQuestion = tempo.value * 10;
        let container = document.querySelector(".container");
        container.innerHTML = '<h1 class="title">Trivia Quest</h1>';
        container.appendChild(perguntas);
        container.appendChild(respostas);
        fetchQuestions = await getQuestions();
    
        getNextQuestion();
    }
}

const getQuestions = async () => {
    let data = undefined;
    if (categoria === "all") {
        data = await fetch(`https://the-trivia-api.com/api/questions?limit=${totalQuestion}&region=PT`);
    }
    else {
        data = await fetch(`https://the-trivia-api.com/api/questions?categories=${categoria}&limit=${totalQuestion}&region=PT`);
    }

    return data.json();
}

const getNextQuestion = () => {
    if (respondidas < totalQuestion) {
        atualQuestion = fetchQuestions[respondidas];
        respondidas++;
        displayQuestion();
        segundos = 0;
        intervalID = setInterval(frame,100);
        function frame () {
            if (timeQuestion != 0) {
                barraTimer.style.transform = `translateX(${(segundos/timeQuestion) * 100}%)`;
                segundos+= 1;
                
                if (segundos > timeQuestion) {
                    wrongAnswer();
                }
            }
        }
    }
    else {
        perguntas.innerHTML = `<b>Trivia finished!</b>
        <span> Final Score </span>
        <span> ${certas} right answers!</span>
        <span> ${erradas} wrong answers!</span>`;
        respostas.textContent ="";
    }
}

buttonQuestion.addEventListener("click",initializeTrivia);

const displayQuestion = () => {
    perguntas.innerHTML = `<div class="categoria">${atualQuestion["category"]}</div>
    <div class="pergunta"><span>Question ${respondidas} of ${totalQuestion}</span><span>${atualQuestion["question"]} </span></div>`;
    let answers = [];
    answers.push(atualQuestion["correctAnswer"]);
    answers = answers.concat(atualQuestion["incorrectAnswers"]);
    answers.sort();
    respostas.innerHTML = "";
    for (let res = 0; res < answers.length;res++) {
        let botao = document.createElement("button");
        botao.innerText = answers[res];
        botao.classList.add("answerButton");
        if (answers[res] === atualQuestion["correctAnswer"]) {
            botao.onclick = rightAnswer;
            indexCorreta = res;
        }
        else botao.onclick = wrongAnswer;
        respostas.appendChild(botao);
    }
    
    if (timeQuestion !== 0) {
        barraTimer = document.createElement("div");
        barraTimer.classList.add("barraTimer");
        respostas.appendChild(barraTimer);
    }
}

const rightAnswer = () => {
    certas++;
    clearInterval(intervalID);
    let botoes = document.querySelectorAll(".answerButton");
    for (let x = 0; x < botoes.length;x++) {
        if (x == indexCorreta) {
            botoes[x].classList.add("correta");
        }
        else {
            botoes[x].classList.add("incorreta");
        }
        botoes[x].disabled = true;
    }

    let next = document.createElement("button");
    next.innerText = "Next Question";
    next.classList.add("next");
    next.onclick = getNextQuestion;
    respostas.appendChild(next);
}

const wrongAnswer = () => {
    erradas++;
    clearInterval(intervalID);
    let botoes = document.querySelectorAll(".answerButton");
    for (let x = 0; x < botoes.length;x++) {
        if (x == indexCorreta) {
            botoes[x].classList.add("correta");
        }
        else {
            botoes[x].classList.add("incorreta");
        }
        botoes[x].disabled = true;

    }
    let next = document.createElement("button");
    next.classList.add("next");
    next.textContent = "Next Question";
    next.onclick = getNextQuestion;
    respostas.appendChild(next);
}
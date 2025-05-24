let correctCount = 0;
let wrongCount = 0;
let seenQuestions = new Set();
let hintStage = 0;
const hintLetters = ['N', 'O', 'O', 'B'];

const tauntText = document.getElementById('character-dialog');
const tauntsIdle = [
    "Still thinking? Hehe...",
    "This one's easy, right? Or is it?",
    "Come on, make a move!",
    "I'm getting bored..."
];
const tauntsWrong = [
    "Wrong again? Classic!",
    "Oof! That must hurt!",
    "Haha! You're really bad at this!",
    "Are you even trying?"
];
const tauntsCorrect = [
    "Oh, lucky guess!",
    "Don't get cocky now!",
    "Fluke, right?",
    "Even a broken clock is right twice a day!"
];

function showLoader(show = true, text = 'LOADING...') {
    const loader = document.getElementById('loader-overlay');
    const loaderText = loader.querySelector('.loader-text');
    loaderText.textContent = text;
    loader.classList.toggle('show', show);
}

function resetGame() {
    correctCount = 0;
    wrongCount = 0;
    hintStage = 0;
    seenQuestions.clear();
    updateScoreboard();
    updateTaunt('idle');
    loadQuiz();
}

function updateScoreboard() {
    document.getElementById('correct-count').textContent = correctCount;
    document.getElementById('wrong-count').textContent = wrongCount;
}

function showHintLetter(letter) {
    showLoader(true, letter);
    setTimeout(() => {
        showLoader(false);
    }, 1500);
}

function celebrateNoob() {
    showLoader(true, 'YOU ARE A NOOB');
    document.querySelector('.loader-text').style.fontSize = '3.5rem';
    setTimeout(() => {
        showLoader(false);
        resetGame();
    }, 3500);
}

function updateTaunt(type) {
    let text = '...';
    if (type === 'idle') {
        text = tauntsIdle[Math.floor(Math.random() * tauntsIdle.length)];
    } else if (type === 'correct') {
        text = tauntsCorrect[Math.floor(Math.random() * tauntsCorrect.length)];
    } else if (type === 'wrong') {
        text = tauntsWrong[Math.floor(Math.random() * tauntsWrong.length)];
    }

    tauntText.textContent = text;
    tauntText.classList.add('jump');
    setTimeout(() => tauntText.classList.remove('jump'), 600);
}

function loadQuiz() {
    showLoader(true);
    fetch('/api/quiz')
        .then(response => response.json())
        .then(data => {
            if (!data || !data.question || !data.choices || !data.correct_answer) {
                throw new Error('Invalid data');
            }

            const questionElem = document.getElementById('question');
            const choicesList = document.getElementById('choices');
            const resultElem = document.getElementById('result');

            document.body.classList.remove('stress', 'wrong', 'correct');

            questionElem.innerHTML = data.question;
            resultElem.textContent = '';
            choicesList.innerHTML = '';

            updateTaunt('idle');

            data.choices.forEach(choice => {
                const li = document.createElement('li');
                li.textContent = choice;

                li.onclick = () => {
                    document.querySelectorAll('#choices li').forEach(item => {
                        item.style.pointerEvents = 'none';
                        item.style.opacity = '0.6';
                    });

                    const isCorrect = (choice === data.correct_answer);
                    resultElem.textContent = isCorrect ? '✅ Correct!' : '❌ Wrong!';

                    if (isCorrect) {
                        correctCount++;
                        updateTaunt('correct');
                        document.body.classList.add('correct');

                        if (correctCount % 10 === 0 && hintStage < hintLetters.length) {
                            showHintLetter(hintLetters[hintStage]);
                            hintStage++;

                            if (hintStage === 4) {
                                setTimeout(celebrateNoob, 2000);
                                return;
                            }
                        }

                        updateScoreboard();
                        setTimeout(() => {
                            document.body.classList.remove('correct');
                            loadQuiz();
                        }, 1000);
                    } else {
                        wrongCount++;
                        updateScoreboard();
                        document.body.classList.add('wrong');
                        updateTaunt('wrong');

                        if (wrongCount % 5 === 0) {
                            document.body.classList.add('stress');
                        }

                        if (wrongCount >= 20) {
                            showLoader(true, 'GAME OVER');
                            setTimeout(() => {
                                showLoader(false);
                                resetGame();
                            }, 3000);
                            return;
                        }

                        setTimeout(() => {
                            document.body.classList.remove('wrong');
                            loadQuiz();
                        }, 1000);
                    }
                };

                choicesList.appendChild(li);
            });

            showLoader(false);
        })
        .catch(err => {
            console.error('Error loading quiz:', err);
            setTimeout(loadQuiz, 1500);
        });
}

document.addEventListener('DOMContentLoaded', loadQuiz);

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('secret-input');
    const output = document.getElementById('secret-output');

    input.addEventListener('input', () => {
        const code = input.value.trim().toUpperCase();
        if (code === 'AAAABBCCDDD') {
            output.style.display = 'block';
            output.textContent = '✅ Go to Layer Blue 5!';
            output.style.color = 'lime';
        } else {
            output.style.display = 'block';
            output.textContent = '❌ Incorrect answer~';
            output.style.color = 'red';
        }
    });
    input.focus();
});


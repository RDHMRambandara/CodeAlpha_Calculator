class Calculator {
constructor() {
this.currentOperation = document.getElementById('current-operation');
this.previousOperation = document.getElementById('previous-operation');
this.themeToggle = document.getElementById('theme-toggle');
this.current = '0';
this.previous = '';
this.operator = null;
this.waitingForNewNumber = false;
this.shouldResetDisplay = false;
this.initializeEventListeners();
this.updateDisplay();
}

initializeEventListeners() {
document.querySelectorAll('.btn').forEach(button => {
button.addEventListener('click', (e) => {
this.handleButtonClick(e.target);
});
});

this.themeToggle.addEventListener('click', () => {
this.toggleTheme();
});

document.addEventListener('keydown', (e) => {
this.handleKeyboard(e);
});
}

handleButtonClick(button) {
const action = button.dataset.action;
const value = button.dataset.value;

if (action) {
this.handleAction(action);
} else if (value) {
this.handleValue(value);
}
this.updateDisplay();
}

handleAction(action) {
switch (action) {
case 'clear':
this.clear();
break;
case 'delete':
this.delete();
break;
case 'equals':
this.calculate();
break;
}
}

handleValue(value) {
if (this.isOperator(value)) {
this.handleOperator(value);
} else {
this.handleNumber(value);
}
}

isOperator(value) {
return ['+', '-', '*', '/', '%'].includes(value);
}

handleNumber(number) {
if (this.shouldResetDisplay) {
this.current = '0';
this.shouldResetDisplay = false;
}

if (number === '.') {
if (this.current.includes('.')) return;
if (this.waitingForNewNumber) {
this.current = '0.';
this.waitingForNewNumber = false;
return;
}
}

if (this.waitingForNewNumber) {
this.current = number;
this.waitingForNewNumber = false;
} else {
this.current = this.current === '0' ? number : this.current + number;
}
}

handleOperator(nextOperator) {
const inputValue = parseFloat(this.current);

if (this.previous === '') {
this.previous = inputValue;
} else if (this.operator && !this.waitingForNewNumber) {
const result = this.performCalculation();
this.current = String(result);
this.previous = result;
} else {
this.previous = inputValue;
}

this.waitingForNewNumber = true;
this.operator = nextOperator;
this.updatePreviousDisplay();
}

calculate() {
if (this.operator && this.previous !== '' && !this.waitingForNewNumber) {
const result = this.performCalculation();
this.current = String(result);
this.previous = '';
this.operator = null;
this.shouldResetDisplay = true;
this.previousOperation.textContent = '';
}
}

performCalculation() {
const prev = parseFloat(this.previous);
const curr = parseFloat(this.current);

if (isNaN(prev) || isNaN(curr)) return 0;

switch (this.operator) {
case '+':
return prev + curr;
case '-':
return prev - curr;
case '*':
return prev * curr;
case '/':
return curr !== 0 ? prev / curr : 0;
case '%':
return prev % curr;
default:
return curr;
}
}

clear() {
this.current = '0';
this.previous = '';
this.operator = null;
this.waitingForNewNumber = false;
this.shouldResetDisplay = false;
this.previousOperation.textContent = '';
}

delete() {
if (this.shouldResetDisplay) {
this.clear();
return;
}

if (this.current.length > 1) {
this.current = this.current.slice(0, -1);
} else {
this.current = '0';
}
}

updateDisplay() {
this.currentOperation.textContent = this.formatNumber(this.current);
}

displayResult(result) {
this.current = String(result);
this.previous = '';
this.operator = null;
this.shouldResetDisplay = true;
this.previousOperation.textContent = '';
this.updateDisplay();
}

updatePreviousDisplay() {
if (this.operator && this.previous !== '') {
const operatorSymbol = this.getOperatorSymbol(this.operator);
this.previousOperation.textContent = `${this.formatNumber(this.previous)} ${operatorSymbol}`;
}
}

getOperatorSymbol(operator) {
const symbols = {
'+': '+',
'-': '−',
'*': '×',
'/': '÷',
'%': '%'
};
return symbols[operator] || operator;
}

formatNumber(number) {
if (number === '' || number === '0') return '0';

const num = parseFloat(number);
if (isNaN(num)) return number;

if (Number.isInteger(num) && Math.abs(num) < 1000000) {
return num.toLocaleString();
}

if (Math.abs(num) >= 1000000000000 || (Math.abs(num) < 0.001 && num !== 0)) {
return num.toExponential(6);
}

const formatted = num.toLocaleString(undefined, {
maximumFractionDigits: 8,
minimumFractionDigits: 0
});
return formatted;
}

toggleTheme() {
const html = document.documentElement;
if (html.getAttribute('data-theme') === 'light') {
html.setAttribute('data-theme', 'dark');
} else {
html.setAttribute('data-theme', 'light');
}
setThemeIcon();
}

handleKeyboard(event) {
const isCalculator = document.querySelector('input[name="mode"][value="calculator"]').checked;
if (!isCalculator) return;

const tag = event.target.tagName.toLowerCase();
if (tag === 'input' || tag === 'textarea' || event.target.isContentEditable) {
return;
}

event.preventDefault();
const key = event.key;

if (key >= '0' && key <= '9') {
this.handleNumber(key);
} else if (key === '.') {
this.handleNumber(key);
} else if (['+', '-', '*', '/', '%'].includes(key)) {
this.handleOperator(key);
} else if (key === 'Enter' || key === '=') {
this.calculate();
} else if (key === 'Escape') {
this.clear();
} else if (key === 'Backspace') {
this.delete();
}

this.updateDisplay();
}
}

class VoiceCalculator {
constructor() {
this.recognition = null;
this.isListening = false;
this.voiceBtn = document.getElementById('voice-btn');
this.voiceText = document.getElementById('voice-text');
this.voiceStatus = document.getElementById('voice-status');
this.aiInput = document.getElementById('ai-input');
this.initializeVoice();
this.initializeEventListeners();
}

initializeVoice() {
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
this.recognition = new SpeechRecognition();
this.recognition.continuous = false;
this.recognition.interimResults = true;
this.recognition.lang = 'en-US';

this.recognition.onstart = () => {
this.isListening = true;
this.voiceBtn.classList.add('listening');
this.voiceStatus.textContent = 'Listening...';
this.voiceText.textContent = '';
};

this.recognition.onresult = (event) => {
let interimTranscript = '';
let finalTranscript = '';

for (let i = event.resultIndex; i < event.results.length; i++) {
const transcript = event.results[i][0].transcript;
if (event.results[i].isFinal) {
finalTranscript += transcript;
} else {
interimTranscript += transcript;
}
}

this.voiceText.textContent = finalTranscript + interimTranscript;

if (finalTranscript) {
this.processVoiceInput(finalTranscript);
}
};

this.recognition.onerror = (event) => {
this.voiceStatus.textContent = `Error: ${event.error}`;
this.stopListening();
};

this.recognition.onend = () => {
this.stopListening();
};
} else {
this.voiceStatus.textContent = 'Speech recognition not supported in this browser.';
this.voiceBtn.disabled = true;
}
}

initializeEventListeners() {
this.voiceBtn.addEventListener('click', () => {
if (this.isListening) {
this.stopListening();
} else {
this.startListening();
}
});
}

startListening() {
if (this.recognition && !this.isListening) {
this.recognition.start();
}
}

stopListening() {
this.isListening = false;
this.voiceBtn.classList.remove('listening', 'processing');
this.voiceStatus.textContent = '';
if (this.recognition) {
this.recognition.stop();
}
}

processVoiceInput(transcript) {
this.voiceBtn.classList.remove('listening');
this.voiceBtn.classList.add('processing');
this.voiceStatus.textContent = 'Processing...';

const cleanTranscript = transcript.trim();
this.voiceText.textContent = cleanTranscript;

const result = this.calculateFromText(cleanTranscript);
if (result !== null) {
calculator.displayResult(result);
this.voiceStatus.textContent = `Answer: ${result}`;
} else {
this.voiceStatus.textContent = 'Could not understand calculation';
}

setTimeout(() => {
this.voiceBtn.classList.remove('processing');
}, 1000);
}

calculateFromText(text) {
    // check for "X% of Y" pattern
    const percentMatch = text.toLowerCase().match(/(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)/);
    if (percentMatch) {
        const percentage = parseFloat(percentMatch[1]);
        const number = parseFloat(percentMatch[2]);
        return (percentage / 100) * number;
    }

    // normal math expression parsing
    const cleanText = text.toLowerCase().replace(/[^\d\s+\-*/%.()=]/g, '');

    const mathExpression = cleanText
        .replace(/plus/g, '+')
        .replace(/minus/g, '-')
        .replace(/times/g, '*')
        .replace(/multiply/g, '*')
        .replace(/divided by/g, '/')
        .replace(/divide/g, '/')
        .replace(/percent/g, '%')
        .replace(/equals/g, '=');

    try {
        const result = Function('"use strict"; return (' + mathExpression.replace(/=/g, '') + ')')();
        return isFinite(result) ? result : null;
    } catch (e) {
        return null;
    }
}

}

const calculator = new Calculator();
const voiceCalculator = new VoiceCalculator();

const toggle = document.getElementById('theme-toggle');
const icon = toggle.querySelector('.theme-icon');

function setThemeIcon() {
const html = document.documentElement;
const currentTheme = html.getAttribute('data-theme');
const isDark = currentTheme === 'dark' || currentTheme === null;

icon.textContent = isDark ? '🌙' : '☀️ ';

if (!currentTheme) {
html.setAttribute('data-theme', 'dark');
}
}

setThemeIcon();

document.addEventListener('DOMContentLoaded', function () {
const modeRadios = document.querySelectorAll('input[name="mode"]');
const voiceSection = document.getElementById('voice-section');
const aiSection = document.getElementById('ai-form');
const calculatorDiv = document.getElementById('calculator-main');
const modeBar = document.querySelector('.mode-switch-section');
const voiceBtn = document.getElementById('voice-btn');
const aiInput = document.getElementById('ai-input');
const aiBtn = document.querySelector('.ai-btn');
const calculatorButtons = document.querySelectorAll('.btn');

modeRadios.forEach(radio => {
radio.checked = (radio.value === 'voice');
});

setTimeout(() => {
updateControlStates();
}, 100);

setTimeout(() => {
window.scrollTo({ top: 0, behavior: 'auto' });
}, 50);

function updateControlStates() {
const selectedMode = document.querySelector('input[name="mode"]:checked').value;

switch (selectedMode) {
case 'voice':
voiceBtn.disabled = false;
aiInput.disabled = true;
aiBtn.disabled = true;
calculatorButtons.forEach(btn => btn.disabled = true);
aiInput.value = '';  
document.getElementById('ai-response').textContent = '';
break;

case 'ai':
voiceBtn.disabled = true;
aiInput.disabled = false;
aiBtn.disabled = false;
calculatorButtons.forEach(btn => btn.disabled = true);
document.getElementById('voice-text').textContent = '';
break;

case 'calculator':
voiceBtn.disabled = true;
aiInput.disabled = true;
aiBtn.disabled = true;
calculatorButtons.forEach(btn => btn.disabled = false);
document.getElementById('voice-text').textContent = '';
aiInput.value = '';  
document.getElementById('ai-response').textContent = '';
break;
}
}

function scrollToSection(mode) {
const barHeight = modeBar.offsetHeight || 56;
setTimeout(() => {
if (mode === 'voice') {
window.scrollTo({
top: 0,
behavior: 'smooth'
});
} else if (mode === 'ai') {
const voiceSectionRect = voiceSection.getBoundingClientRect();
const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
window.scrollTo({
top: voiceSectionRect.bottom + scrollTop - barHeight - 12,
behavior: 'smooth'
});
} else if (mode === 'calculator') {
const calculatorRect = calculatorDiv.getBoundingClientRect();
const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
window.scrollTo({
top: calculatorRect.top + scrollTop - barHeight - 12,
behavior: 'smooth'
});
}
}, 100);
}

modeRadios.forEach(radio => {
radio.addEventListener('change', function () {
if (this.checked) {
document.getElementById('current-operation').textContent = '0';
document.getElementById('previous-operation').textContent = '';
calculator.current = '0';
calculator.previous = '';
calculator.operator = null;
calculator.waitingForNewNumber = false;
calculator.shouldResetDisplay = false;
updateControlStates();
scrollToSection(this.value);
}
});
});

const aiForm = document.getElementById('ai-form');
aiForm.addEventListener('submit', function(e) {
e.preventDefault();
const question = aiInput.value.trim();
if (question) {
const result = processAIQuestion(question);
if (result !== null) {
calculator.displayResult(result);
document.getElementById('ai-response').textContent = `Answer: ${result}`;
} else {
document.getElementById('ai-response').textContent = 'Could not calculate the result';
}
}
});

function processAIQuestion(question) {
const cleanQuestion = question.toLowerCase();

const percentMatch = cleanQuestion.match(/(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)/);
if (percentMatch) {
const percentage = parseFloat(percentMatch[1]);
const number = parseFloat(percentMatch[2]);
return (percentage / 100) * number;
}

const mathExpression = cleanQuestion
.replace(/what\s+is\s+/g, '')
.replace(/calculate\s+/g, '')
.replace(/plus/g, '+')
.replace(/minus/g, '-')
.replace(/times/g, '*')
.replace(/multiply/g, '*')
.replace(/divided\s+by/g, '/')
.replace(/divide/g, '/')
.replace(/percent/g, '%')
.replace(/[^\d\s+\-*/%.()]/g, '');

try {
const result = Function('"use strict"; return (' + mathExpression + ')')();
return isFinite(result) ? result : null;
} catch (e) {
return null;
}
}

});


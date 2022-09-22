'use strict';
import * as baseFunction from './modules/functions.js';
import './vendors/vendors.js';
import IMask from 'imask';
// Проверка поддержки webP
baseFunction.testWebP();

// Принятие условий сайта, срабатывает 1 раз при первом заходе
const compliteModal = document.querySelector('#compliteModal');
const compliteBtn = compliteModal.querySelector('.complite-btn');
compliteBtn.onclick = function () {
    compliteModal.classList.remove('show');
    localStorage.setItem('AcceptAndContinue', true);
}
if (localStorage.getItem('AcceptAndContinue')) {
    compliteModal.classList.remove('show');
}

// Маска на номера телефона
document.querySelectorAll('input[type="tel"]').forEach(input => { IMask(input, { mask: '+{7}(000) 000-00-00' }) });

// Выбор типа проекта
const radioSelect = document.querySelectorAll('[data-radio-id]');
radioSelect.forEach(radioBtn => {
    radioBtn.addEventListener('change', (e) => {
        const selectedRadioId = e.target.dataset.radioId;
        document.querySelector('.questions-wrapper.show')?.classList.remove('show');
        document.querySelector(`#${selectedRadioId}`)?.classList.add('show');
    });
});


// Ограничение 100MB
const correсtFileSize = 100 * 1024 * 1024;
const fileInputs = document.querySelectorAll('input[type="file"]');
fileInputs.forEach(fileInput => {
    fileInput.addEventListener('input', (e) => {
        const input = e.target;
        const inputParent = input.closest('.question__file');
        inputParent.classList.remove('_error');
        inputParent.classList.remove('successful');

        const selectedFiles = input.files;
        const isHasError = [...selectedFiles].some(file => {
            const fileSize = file.size;
            return fileSize >= correсtFileSize;
        });
        if (isHasError) {
            inputParent.classList.add("_error");
        }
        else {
            inputParent.classList.add("successful");
        }
    });
});

const userDataFields = [...document.querySelectorAll('._req')];
const questionForm = document.querySelector('#questions-form');
const loadModal = document.querySelector('#loadModal');


function userDataFieldsValid(arr) {
    arr.forEach(field => {
        const fieldParent = field.closest('.personal-data__item');
        const fieldId = field.id;
        if (fieldId === 'userName') {
            const userNameValue = field.value.trim();
            userNameValue.length < 2 && fieldParent.classList.add('_error');
        }

        if (fieldId === 'userPhone') {
            const userPhoneValue = field.value
                .trim();
            userPhoneValue.length < 17 && fieldParent.classList.add('_error');
        }

        if (fieldId === 'userEmail') {
            const userPhoneValue = field.value.trim();
            if (!isEmailValid(userPhoneValue)) {
                fieldParent.classList.add('_error');
            }
        }
        field.addEventListener('input', (e) => {
            const parentWidthError = e.target.closest('.personal-data__item');
            parentWidthError.classList.remove('_error');
            isHasErronInFrom();
        }, { once: true })
    });
}

function isHasErronInFrom() {
    const formActiveQuestionsBlock = document.querySelector('.questions-wrapper.show');
    const userDataField = document.querySelector('.personal-data');

    if (formActiveQuestionsBlock.querySelector('._error') || userDataField.querySelector('._error')) {
        document.querySelector('.questions-wrapper.show').classList.add('_error')
    } else {
        document.querySelector('.questions-wrapper.show').classList.remove('_error');
    }
}

const EMAIL_REGEXP = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;
function isEmailValid(value) {
    return EMAIL_REGEXP.test(value)
}

questionForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const activeQuestionsBlock = questionForm.querySelector('.questions-wrapper.show');
    activeQuestionsBlock.classList.remove('_error');
    const questionItems = activeQuestionsBlock.querySelectorAll('.question-block');
    questionItems.forEach(item => {
        const textareaField = item.querySelector('textarea');
        const textareaValue = textareaField.value.trim();
        if (textareaValue.length < 1) {
            item.classList.add('_error');

            textareaField.addEventListener('input', (e) => {
                const parentWidthError = e.target.closest('.question-block');
                parentWidthError.classList.remove('_error');
                isHasErronInFrom();
            }, { once: true });
        }
    });
    userDataFieldsValid(userDataFields);
    const isHasError = activeQuestionsBlock.querySelector('._error');
    const porsonalDataErrors = document.querySelectorAll('.personal-data ._error');

    if (isHasError || porsonalDataErrors.length > 0) {
        activeQuestionsBlock.classList.add('_error');
    }
    else {
        // Конструктор FormData
        let formData = new FormData();
        // Данные полей
        const userName = document.querySelector('#userName')?.value;
        const userPhone = document.querySelector('#userPhone')?.value;
        const userEmail = document.querySelector('#userEmail')?.value;
        formData.append('userName', userName);
        formData.append('userPhone', userPhone);
        formData.append('userEmail', userEmail);

        // Тип проекта
        const projectType = [...document.querySelectorAll('[name="select-project"]')]
            .find(item => item.checked)
            .closest('.selection-item')
            .querySelector('.selection-item__title').innerHTML;
        formData.append('projectType', projectType);

        // Ответы на вопросы
        const questionAnswers = [...questionItems].map(item => {
            const area = item.querySelector('textarea');
            return area.value;
        });

        // Заголовки вопросов
        const questionTitle = [...questionItems].map(item => {
            const title = item.querySelector('.question__title');
            return title.innerHTML;
        });
        //Файлы
        const questionFiles = [...questionItems].map((item, position) => {
            const title = item.querySelector('.question__title').innerHTML;
            const filesInput = item.querySelector('input[type="file"]');
            const files = filesInput.files;
            for (let index = 0; index < files.length; index++) {
                const element = files[index];
                formData.append(`Файл по вопросу:"${title}"-${index + 1}`, element);
            }
        });
        //Массив с вопросами и ответами
        const answersDataArr = questionTitle.reduce((acc, item, index) => {
            acc.push({
                "title": item,
                'answer': questionAnswers[index],
            });
            return acc;
        }, []);
        // Фассив переделан в обьект и добавлен в конструктор формы в виде JSON строки
        const answersDataObj = Object.assign({}, answersDataArr);
        formData.append('answerDada', JSON.stringify(answersDataObj));


        // Показываем модалку с отправкой
        loadModal.classList.add('show');

        // Отправляем
        let response = await fetch('sendmail.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            body: formData
        });
        if (response.ok) {
            //если всё ок вывести модалку об успешной отправке
            loadModal.classList.add('loaded');
        } else {
            loadModal.classList.remove('show');
            alert('Произошла ошибка, попробуйте позднее');
        }
    }
});

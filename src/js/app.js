'use strict';
import * as baseFunction from './modules/functions.js';
import './vendors/vendors.js';
import IMask from 'imask';
// Проверка поддержки webP
baseFunction.testWebP();

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
(function () {
    'use strict';

    const payload = {
        salt: 'Y3VtcGxlLXN0YXRpYy1hY2Nlc3MtdjE=',
        iv: 'MDEyMzQ1Njc4OWFiY2RlZg==',
        data: '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'
    };

    function decode(value) {
        const binary = atob(value);
        return Uint8Array.from(binary, character => character.charCodeAt(0));
    }

    async function decrypt(code) {
        const keyMaterial = await crypto.subtle.importKey(
            'raw', new TextEncoder().encode(code), 'PBKDF2', false, ['deriveKey']
        );
        const key = await crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt: decode(payload.salt), iterations: 120000, hash: 'SHA-1' },
            keyMaterial, { name: 'AES-CBC', length: 256 }, false, ['decrypt']
        );
        const plaintext = await crypto.subtle.decrypt(
            { name: 'AES-CBC', iv: decode(payload.iv) }, key, decode(payload.data)
        );
        return new TextDecoder().decode(plaintext);
    }

    const form = document.getElementById('access-form');
    if (!form) {
        if (sessionStorage.getItem('access-granted') !== 'true') {
            window.location.replace('index.html');
        }
        return;
    }

    const input = document.getElementById('access-code');
    const error = document.getElementById('access-error');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        error.textContent = '';
        input.disabled = true;
        try {
            document.body.innerHTML = await decrypt(input.value);
            const links = [
                ['preguntas.html', 'Preguntas y respuestas'],
                ['Eventos.html', 'Calendario']
            ];
            links.reverse().forEach(function ([href, label]) {
                const link = document.createElement('div');
                link.className = 'Menu-header questions-link';
                link.innerHTML = '<a href="' + href + '"><span>' + label + '</span></a>';
                document.body.insertBefore(link, document.body.firstChild);
            });
            sessionStorage.setItem('access-granted', 'true');
        } catch (exception) {
            error.textContent = 'Codigo incorrecto.';
            input.value = '';
            input.disabled = false;
            input.focus();
        }
    });
}());
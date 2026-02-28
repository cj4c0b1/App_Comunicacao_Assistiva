/**
 * Mock do objeto System para simular funcionalidades nativas no navegador.
 */
window.System = {
    Voice: {
        speak: (text, options) => {
            console.log(`[Voice] Speaking: "${text}"`, options);
            
            // Cancela qualquer fala anterior
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = options.rate || 1.0;
            utterance.pitch = options.pitch || 1.0;

            // Define o idioma correto para pronúncia nativa
            utterance.lang = window.currentLang || 'pt-BR';

            // Tenta encontrar a melhor voz nativa disponível
            const voices = window.speechSynthesis.getVoices();
            const lang = utterance.lang;
            // Prioriza vozes que correspondem exatamente ao locale (ex: pt-BR)
            let bestVoice = voices.find(v => v.lang === lang);
            // Fallback: qualquer voz do mesmo idioma base (ex: pt)
            if (!bestVoice) {
                const baseLang = lang.split('-')[0];
                bestVoice = voices.find(v => v.lang.startsWith(baseLang));
            }
            if (bestVoice) {
                utterance.voice = bestVoice;
                console.log(`[Voice] Usando voz: ${bestVoice.name} (${bestVoice.lang})`);
            }

            window.speechSynthesis.speak(utterance);
            
            // Log visual no simulador
            const log = document.getElementById('system-log');
            if (log) log.innerHTML += `<div><b>Voz (${utterance.lang}):</b> ${text}</div>`;
        }
    },
    Video: {
        play: (path) => {
            console.log(`[Video] Playing: ${path}`);
            const log = document.getElementById('system-log');
            if (log) log.innerHTML += `<div><b>Vídeo:</b> Iniciando sinal (${path})</div>`;
            
            // Simulação visual de vídeo
            const videoArea = document.getElementById('video-simulator');
            if (videoArea) {
                videoArea.innerText = `🎬 Vídeo: ${path}`;
                videoArea.style.background = '#333';
                setTimeout(() => {
                    videoArea.innerText = 'Avatar Pronto';
                    videoArea.style.background = '#1a1a1a';
                }, 3000);
            }
        }
    },
    GPS: {
        getCoords: (callback) => {
            console.log('[GPS] Getting coordinates...');
            // Coordenadas fictícias (São Paulo)
            const lat = -23.5505;
            const lon = -46.6333;
            callback(lat, lon);
        }
    },
    SMS: {
        send: (contact, message) => {
            console.log(`[SMS] To: ${contact}, Message: ${message}`);
            const log = document.getElementById('system-log');
            if (log) log.innerHTML += `<div style="color: #ff5555"><b>SMS enviado para ${contact}:</b> ${message}</div>`;
            alert(`SMS de Emergência enviado!\nPara: ${contact}\nMsg: ${message}`);
        }
    }
};

// Variável de idioma global usada no ui_layout.xml
window.currentLang = 'pt-BR';

/**
 * Função para alterar o idioma no simulador
 */
window.setLanguage = (lang) => {
    window.currentLang = lang;
    console.log(`Idioma alterado para: ${lang}`);
    document.getElementById('current-lang-display').innerText = lang;
};

// Inicialização Básica
document.addEventListener('DOMContentLoaded', () => {
    console.log('Simulador Antigravity Inicializado.');
});

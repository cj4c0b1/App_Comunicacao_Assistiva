// Motor de Execução Bimodal — App Comunicação Assistiva
const AppCore = {
  // Configurações e Estado
  config: {
    interactionMode: 'slide',   // 'default' ou 'slide'
    repetitionDelay: 3000,      // Tempo para evitar repetição (ms)
  },
  state: {
    lastActiveId: null,      // Último botão ativado
    lastActiveTime: 0,       // Timestamp da última ativação
    isDragging: false        // Se o usuário está com o dedo na tela
  },

  // Banco de Dados de Comandos (expandido)
  commands: {
    'happy':     { icon: '😊', pt: 'Estou feliz!',         en: 'I am happy!',        de: 'Ich bin froh!',           fr: 'Je suis content!' },
    'sleep':     { icon: '💤', pt: 'Quero dormir.',         en: 'I want to sleep.',    de: 'Ich möchte schlafen.',    fr: 'Je veux dormir.' },
    'walk':      { icon: '🚶', pt: 'Quero caminhar.',       en: 'I want to walk.',     de: 'Ich möchte gehen.',      fr: 'Je veux marcher.' },
    'run':       { icon: '🏃', pt: 'Quero correr.',         en: 'I want to run.',      de: 'Ich möchte laufen.',     fr: 'Je veux courir.' },
    'rest':      { icon: '🛋️', pt: 'Quero descansar.',      en: 'I want to rest.',     de: 'Ich möchte ruhen.',      fr: 'Je veux me reposer.' },
    'hungry':    { icon: '🍽️', pt: 'Estou com fome.',       en: 'I am hungry.',        de: 'Ich habe Hunger.',       fr: "J'ai faim." },
    'thirsty':   { icon: '💧', pt: 'Estou com sede.',       en: 'I am thirsty.',       de: 'Ich habe Durst.',        fr: "J'ai soif." },
    'pain':      { icon: '🤕', pt: 'Estou com dor.',        en: 'I am in pain.',       de: 'Ich habe Schmerzen.',    fr: "J'ai mal." },
    'bathroom':  { icon: '🚻', pt: 'Preciso ir ao banheiro.', en: 'I need the bathroom.', de: 'Ich muss zur Toilette.', fr: 'Je dois aller aux toilettes.' },
    'cold':      { icon: '🥶', pt: 'Estou com frio.',       en: 'I am cold.',          de: 'Mir ist kalt.',           fr: "J'ai froid." },
    'hot':       { icon: '🥵', pt: 'Estou com calor.',      en: 'I am hot.',           de: 'Mir ist heiß.',           fr: "J'ai chaud." },
    'tv':        { icon: '📺', pt: 'Quero ver TV.',         en: 'I want to watch TV.', de: 'Ich möchte fernsehen.',    fr: 'Je veux regarder la TV.' },
    'radio':     { icon: '📻', pt: 'Quero ouvir rádio.',    en: 'I want to hear radio.', de: 'Ich möchte Radio hören.', fr: 'Je veux écouter la radio.' },
    'help':      { icon: '🆘', pt: 'Preciso de ajuda!',     en: 'I need help!',        de: 'Ich brauche Hilfe!',     fr: "J'ai besoin d'aide!" },
  },

  init: () => {
    AppCore.loadSettings();
    AppCore.setupEventListeners();
  },

  loadSettings: () => {
    const saved = localStorage.getItem('RenatoApp_Config');
    if (saved) {
      AppCore.config = { ...AppCore.config, ...JSON.parse(saved) };
      // Atualizar UI do checkbox se necessário
      const radio = document.querySelector(`input[name="touch-mode"][value="${AppCore.config.interactionMode}"]`);
      if (radio) radio.checked = true;
    }
  },

  saveSettings: () => {
    localStorage.setItem('RenatoApp_Config', JSON.stringify(AppCore.config));
  },

  updateConfig: (key, value) => {
    AppCore.config[key] = value;
    AppCore.saveSettings();
    console.log(`[Config] ${key} atualizado para: ${value}`);
  },

  setupEventListeners: () => {
    // Escuta eventos de ponteiro para o modo deslizar
    document.addEventListener('pointerdown', (e) => {
      AppCore.state.isDragging = true;
      AppCore.handlePointer(e);
    });

    document.addEventListener('pointermove', (e) => {
      if (AppCore.state.isDragging) {
        AppCore.handlePointer(e);
      }
    });

    document.addEventListener('pointerup', () => {
      AppCore.state.isDragging = false;
      AppCore.state.lastActiveId = null; // Reseta para permitir re-ativação ao tocar novamente
    });
  },

  handlePointer: (e) => {
    if (AppCore.config.interactionMode !== 'slide') return;

    const element = document.elementFromPoint(e.clientX, e.clientY);
    const button = element?.closest('.btn-assistive');
    
    if (button) {
      const id = button.getAttribute('data-id');
      AppCore.activateButton(id, window.currentLang, true);
    }
  },

  // Função disparada ao clicar na tela do Tablet (Modo Padrão)
  onButtonClick: (id, lang) => {
    if (AppCore.config.interactionMode === 'default') {
      AppCore.activateButton(id, lang, false);
    }
  },

  activateButton: (id, lang, isAuto = false) => {
    const now = Date.now();
    
    // Lógica de Prevenção de Repetição
    if (id === AppCore.state.lastActiveId) {
      if (now - AppCore.state.lastActiveTime < AppCore.config.repetitionDelay) {
        return; // Ignora se for o mesmo botão e dentro do cooldown
      }
    }

    const shortLang = lang.split("-")[0];
    const cmd = AppCore.commands[id];
    if (!cmd) return;

    // Atualiza estado
    AppCore.state.lastActiveId = id;
    AppCore.state.lastActiveTime = now;

    // Feedback visual temporário (escala)
    const btn = document.querySelector(`.btn-assistive[data-id="${id}"]`);
    if (btn) {
      btn.style.transform = 'scale(1.1)';
      setTimeout(() => btn.style.transform = '', 300);
    }

    // 1. Executa Voz (Text-to-Speech)
    System.Voice.speak(cmd[shortLang], { rate: 0.8, pitch: 1.0 });

    // 2. Executa Vídeo de Sinais (Avatar)
    System.Video.play(`assets/signs/${lang}/${id}.mp4`);

    // 3. Lógica de Emergência (GPS + WhatsApp)
    if (id === "help") {
      System.Voice.speak("ALERTA DE EMERGÊNCIA ENVIADO", { rate: 1.0 });
      System.GPS.getCoords((lat, lon) => {
        System.SMS.send(
          "CONTATO_EMERGENCIA",
          `ALERTA: Preciso de ajuda! Local: maps.google.com?q=${lat},${lon}`,
        );
      });
    }

    const log = document.getElementById('system-log');
    if (log) log.innerHTML += `<div>[${isAuto ? 'Slide' : 'Click'}] Ativado: ${id}</div>`;
  },
};

// Inicializa o núcleo
AppCore.init();

// Motor de Execução Bimodal — App Comunicação Assistiva
const AppCore = {
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
    'help':      { icon: '🆘', pt: 'Preciso de ajuda!',     en: 'I need help!',        de: 'Ich brauche Hilfe!',     fr: "J'ai besoin d'aide!" },
  },

  // Função disparada ao clicar na tela do Tablet
  onButtonClick: (id, lang) => {
    // Normaliza o idioma para 2 letras (ex: 'pt-BR' -> 'pt')
    const shortLang = lang.split("-")[0];
    const cmd = AppCore.commands[id];
    if (!cmd) return;

    // 1. Executa Voz (Text-to-Speech)
    System.Voice.speak(cmd[shortLang], { rate: 0.8, pitch: 1.0 });

    // 2. Executa Vídeo de Sinais (Avatar)
    System.Video.play(`assets/signs/${lang}/${id}.mp4`);

    // 3. Lógica de Emergência (GPS + WhatsApp)
    if (id === "help") {
      System.GPS.getCoords((lat, lon) => {
        System.SMS.send(
          "CONTATO_EMERGENCIA",
          `ALERTA: Preciso de ajuda! Local: maps.google.com?q=${lat},${lon}`,
        );
      });
    }
  },
};

// Placeholder content — replace with the real podcast copy and episode data.
import showCover from '../assets/images/startGif.gif';
import episode1Cover from '../assets/images/episode-1-cover.svg';
import episode2Cover from '../assets/images/episode-2-cover.svg';
import episode3Cover from '../assets/images/episode-3-cover.svg';
import episode4Cover from '../assets/images/episode-4-cover.svg';
import episode5Cover from '../assets/images/episode-5-cover.svg';

export const podcast = {
  name: '¡Oye, tía!',
  tagline: 'POV: tienes veinte años, te independizas con tu mejor amiga ' + 
            'y descubres que ser adulta era básicamente pagar facturas y tener conversaciones existenciales a las 2 a. m.',
  description:
    'Bienvenida/os al circo de Lucía Camacho y Elena Morales, ' +
    'en donde la música inspira las reflexiones más filosóficas y profundas (o eso creen ellas) ' +
    'sobre la juventud, hacerse adulto, ser mujer, el amor y el miedo al futuro, ' +
    'mientras hacen exactamente lo que harían dos amigas normales en casa. ' +
    ' \n' + 
    'Una especie de The Office, pero sin oficina, sin cámara, sin presupuesto y con bastante más crisis existencial. ' +
    'Una ficción sonora para la generación que no sabe lo que hace.',
  coverImage: showCover,
  links: [
    { label: 'Spotify', url: '#' },
    { label: 'Apple Podcasts', url: '#' },
    { label: 'YouTube', url: '#' },
  ],
};

export const episodes = [
  {
    id: 1,
    title: 'De mayor seré…',
    description:
      'Nuestra casa es tu casa y nuestras conversaciones son las tuyas. ¡Acompáñanos en nuestra metamorfosis hacia la vida adulta!',
    cover: episode1Cover,
    audioSrc: '/audio/episode-1.wav',
    duration: '32 min',
    available: false,
  },
  {
    id: 2,
    title: '¡Nos mudamos!',
    description:
      'Hacer las maletas nunca fue fácil. Si no que se lo digan a Bad Bunny o a Hannah Montana.',
    cover: episode2Cover,
    audioSrc: '/audio/episode-2.wav',
    duration: '28 min',
    available: false,
  },
  {
    id: 3,
    title: '¿Y qué pasa si no quiero?',
    description:
      'Estudia, trabaja, independízate, cásate y ten hijos. Lógico. Ahora solo falta descubrir quién escribió este tutorial y cómo desinstalarlo.',
    cover: episode3Cover,
    audioSrc: '/audio/episode-3.wav',
    duration: '35 min',
    available: false,
  },
  {
    id: 4,
    title: 'Solo somos dos chicas pero…',
    description:
      'Solo soy una chica”. Sin duda. Barbie tuvo un monólogo entero para explicarlo. Nosotras tenemos un piso y demasiadas preguntas.',
    cover: episode4Cover,
    audioSrc: '/audio/episode-4.wav',
    duration: '30 min',
    available: false,
  },
  {
    id: 5,
    title: '¿El FOMO tiene FOMO?',
    description:
      'Primera y última vez teniendo 22. Qué envidia le daría a nuestro yo de 30.',
    cover: episode5Cover,
    audioSrc: '/audio/oyetia_podcast_tfg.mp3',
    duration: '37 min',
  },
];

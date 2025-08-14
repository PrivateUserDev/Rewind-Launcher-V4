import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  url: string;
  cover?: string;
}

interface MusicPlayerProps {
  theme: 'graduation' | 'seventeen' | 'deathrace' | 'question' | 'gbgr' | 'lnd' | 'ye' | 'yeezus' | 'morechaos' | 'unity' | 'teenagedream' | 'pinktape';
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ theme }) => {
  const { currentTheme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isExpanded, setIsExpanded] = useState(false);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useEmbedPlayer, setUseEmbedPlayer] = useState(true);
  const [savedPlaybackState, setSavedPlaybackState] = useState({ time: 0, wasPlaying: false });
  const audioRef = useRef<HTMLAudioElement>(null);
  audioError;  // read ts so launcher builds
  currentTheme;  // read ts so launcher builds
  setUseEmbedPlayer;

  // yeahhh had to do ALLLL this manually bro
  const graduationPlaylist: Track[] = [
    {
      id: '1',
      title: 'Good Morning',
      artist: 'Kanye West',
      album: 'Graduation',
      duration: '3:15',
      url: 'https://archive.org/download/graduation_20240416/01%20-%20Kanye%20West%20-%20Good%20Morning.mp3',
      cover: 'https://upload.wikimedia.org/wikipedia/en/7/70/Graduation_%28album%29.jpg'
    },
    {
      id: '2',
      title: 'Champion',
      artist: 'Kanye West',
      album: 'Graduation',
      duration: '2:47',
      url: 'https://archive.org/download/graduation_20240416/02%20-%20Kanye%20West%20-%20Champion.mp3',
      cover: 'https://upload.wikimedia.org/wikipedia/en/7/70/Graduation_%28album%29.jpg'
    },
    {
      id: '3',
      title: 'Stronger',
      artist: 'Kanye West',
      album: 'Graduation',
      duration: '5:11',
      url: 'https://archive.org/download/graduation_20240416/03%20-%20Kanye%20West%20-%20Stronger.mp3',
      cover: 'https://upload.wikimedia.org/wikipedia/en/7/70/Graduation_%28album%29.jpg'
    },
    {
      id: '4',
      title: 'I Wonder',
      artist: 'Kanye West',
      album: 'Graduation',
      duration: '4:03',
      url: 'https://archive.org/download/graduation_20240416/04%20-%20Kanye%20West%20-%20I%20%20Wonder.mp3',
      cover: 'https://upload.wikimedia.org/wikipedia/en/7/70/Graduation_%28album%29.jpg'
    },
    {
      id: '5',
      title: 'Good Life',
      artist: 'Kanye West ft. T-Pain',
      album: 'Graduation',
      duration: '3:27',
      url: 'https://archive.org/download/graduation_20240416/05%20-%20Kanye%20West%20-%20Good%20Life%20%28ft.%20T-Pain%29.mp3',
      cover: 'https://upload.wikimedia.org/wikipedia/en/7/70/Graduation_%28album%29.jpg'
    },
    {
      id: '6',
      title: 'Can\'t Tell Me Nothing',
      artist: 'Kanye West',
      album: 'Graduation',
      duration: '4:31',
      url: 'https://archive.org/download/graduation_20240416/06%20-%20Kanye%20West%20-%20Can%27t%20Tell%20Me%20Nothing.mp3',
      cover: 'https://upload.wikimedia.org/wikipedia/en/7/70/Graduation_%28album%29.jpg'
    },
    {
      id: '7',
      title: 'Barry Bonds',
      artist: 'Kanye West ft. Lil\' Wayne',
      album: 'Graduation',
      duration: '3:24',
      url: 'https://archive.org/download/graduation_20240416/07%20-%20Kanye%20West%20-%20Barry%20Bonds%20%28ft.%20Lil%27%20Wayne%29.mp3',
      cover: 'https://upload.wikimedia.org/wikipedia/en/7/70/Graduation_%28album%29.jpg'
    },
    {
      id: '8',
      title: 'Drunk And Hot Girls',
      artist: 'Kanye West ft. Mos Def',
      album: 'Graduation',
      duration: '5:13',
      url: 'https://archive.org/download/graduation_20240416/08%20-%20Kanye%20West%20-%20Drunk%20And%20Hot%20Girls%20%28ft.%20Mos%20Def%29.mp3',
      cover: 'https://upload.wikimedia.org/wikipedia/en/7/70/Graduation_%28album%29.jpg'
    },
    {
      id: '9',
      title: 'Flashing Lights',
      artist: 'Kanye West ft. Dwele',
      album: 'Graduation',
      duration: '3:57',
      url: 'https://archive.org/download/graduation_20240416/09%20-%20Kanye%20West%20-%20Flash%20Lights%20%28ft.%20Dwele%29.mp3',
      cover: 'https://upload.wikimedia.org/wikipedia/en/7/70/Graduation_%28album%29.jpg'
    },
    {
      id: '10',
      title: 'Everything I Am',
      artist: 'Kanye West ft. DJ Premier',
      album: 'Graduation',
      duration: '3:47',
      url: 'https://archive.org/download/graduation_20240416/10%20-%20Kanye%20West%20-%20Everything%20I%20Am%20%28ft.%20DJ%20Premier%29.mp3',
      cover: 'https://upload.wikimedia.org/wikipedia/en/7/70/Graduation_%28album%29.jpg'
    },
    {
      id: '11',
      title: 'The Glory',
      artist: 'Kanye West',
      album: 'Graduation',
      duration: '3:32',
      url: 'https://archive.org/download/graduation_20240416/11%20-%20Kanye%20West%20-%20The%20Glory.mp3',
      cover: 'https://upload.wikimedia.org/wikipedia/en/7/70/Graduation_%28album%29.jpg'
    },
    {
      id: '12',
      title: 'Homecoming',
      artist: 'Kanye West ft. Chris Martin',
      album: 'Graduation',
      duration: '3:18',
      url: 'https://archive.org/download/graduation_20240416/12%20-%20Kanye%20West%20-%20Homecoming%20%28ft.%20Chris%20Martin%29.mp3',
      cover: 'https://upload.wikimedia.org/wikipedia/en/7/70/Graduation_%28album%29.jpg'
    },
    {
      id: '13',
      title: 'Big Brother',
      artist: 'Kanye West',
      album: 'Graduation',
      duration: '4:48',
      url: 'https://archive.org/download/graduation_20240416/13%20-%20Kanye%20West%20-%20Big%20Brother.mp3',
      cover: 'https://upload.wikimedia.org/wikipedia/en/7/70/Graduation_%28album%29.jpg'
    }
  ];

  const deathracePlaylist: Track[] = [
    {
      id: '1',
      title: 'Empty',
      artist: 'Juice WRLD',
      album: 'Death Race for Love',
      duration: '3:36',
      url: 'https://archive.org/download/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Juice%20WRLD%20DRFL%20BTV%2001%20Empty.mp3',
      cover: 'https://ia600307.us.archive.org/20/items/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Death%20Race%20For%20Love%20%28Album%20Cover%29.jpg'
    },
    {
      id: '2',
      title: 'Maze',
      artist: 'Juice WRLD',
      album: 'Death Race for Love',
      duration: '2:18',
      url: 'https://archive.org/download/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Juice%20WRLD%20DRFL%20BTV%2002%20Maze.mp3',
      cover: 'https://ia600307.us.archive.org/20/items/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Death%20Race%20For%20Love%20%28Album%20Cover%29.jpg'
    },
    {
      id: '3',
      title: 'HeMotions',
      artist: 'Juice WRLD',
      album: 'Death Race for Love',
      duration: '2:51',
      url: 'https://archive.org/download/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Juice%20WRLD%20DRFL%20BTV%2003%20HeMotions.mp3',
      cover: 'https://ia600307.us.archive.org/20/items/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Death%20Race%20For%20Love%20%28Album%20Cover%29.jpg'
    },
    {
      id: '4',
      title: 'Demonz (ft. Brent Faiyaz)',
      artist: 'Juice WRLD',
      album: 'Death Race for Love',
      duration: '1:40',
      url: 'https://archive.org/download/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Juice%20WRLD%20DRFL%20BTV%2004%20Demonz%20%28ft.%20Brent%20Faiyaz%29.mp3',
      cover: 'https://ia600307.us.archive.org/20/items/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Death%20Race%20For%20Love%20%28Album%20Cover%29.jpg'
    },
    {
      id: '5',
      title: 'Fast',
      artist: 'Juice WRLD',
      album: 'Death Race for Love',
      duration: '3:06',
      url: 'https://archive.org/download/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Juice%20WRLD%20DRFL%20BTV%2005%20Fast.mp3',
      cover: 'https://ia600307.us.archive.org/20/items/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Death%20Race%20For%20Love%20%28Album%20Cover%29.jpg'
    },
    {
      id: '6',
      title: 'Hear Me Calling',
      artist: 'Juice WRLD',
      album: 'Death Race for Love',
      duration: '2:53',
      url: 'https://archive.org/download/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Juice%20WRLD%20DRFL%20BTV%2006%20Hear%20Me%20Calling.mp3',
      cover: 'https://ia600307.us.archive.org/20/items/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Death%20Race%20For%20Love%20%28Album%20Cover%29.jpg'
    },
    {
      id: '7',
      title: 'Big',
      artist: 'Juice WRLD',
      album: 'Death Race for Love',
      duration: '3:18',
      url: 'https://archive.org/download/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Juice%20WRLD%20DRFL%20BTV%2007%20Big.mp3',
      cover: 'https://ia600307.us.archive.org/20/items/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Death%20Race%20For%20Love%20%28Album%20Cover%29.jpg'
    },
    {
      id: '8',
      title: 'Robbery',
      artist: 'Juice WRLD',
      album: 'Death Race for Love',
      duration: '3:31',
      url: 'https://archive.org/download/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Juice%20WRLD%20DRFL%20BTV%2008%20Robbery.mp3',
      cover: 'https://ia600307.us.archive.org/20/items/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Death%20Race%20For%20Love%20%28Album%20Cover%29.jpg'
    },
    {
      id: '9',
      title: 'Flaws and Sins',
      artist: 'Juice WRLD',
      album: 'Death Race for Love',
      duration: '3:13',
      url: 'https://archive.org/download/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Juice%20WRLD%20DRFL%20BTV%2009%20Flaws%20and%20Sins.mp3',
      cover: 'https://ia600307.us.archive.org/20/items/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Death%20Race%20For%20Love%20%28Album%20Cover%29.jpg'
    },
    {
      id: '10',
      title: 'Feeling',
      artist: 'Juice WRLD',
      album: 'Death Race for Love',
      duration: '3:01',
      url: 'https://archive.org/download/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Juice%20WRLD%20DRFL%20BTV%2010%20Feeling.mp3',
      cover: 'https://ia600307.us.archive.org/20/items/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Death%20Race%20For%20Love%20%28Album%20Cover%29.jpg'
    },
    {
      id: '11',
      title: 'Bandit (ft. NBA YoungBoy)',
      artist: 'Juice WRLD',
      album: 'Death Race for Love',
      duration: '1:33',
      url: 'https://archive.org/download/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Juice%20WRLD%20DRFL%20BTV%2011%20Bandit%20%28ft.%20NBA%20YoungBoy%29.mp3',
      cover: 'https://ia600307.us.archive.org/20/items/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Death%20Race%20For%20Love%20%28Album%20Cover%29.jpg'
    },
    {
      id: '12',
      title: 'Syphilis',
      artist: 'Juice WRLD',
      album: 'Death Race for Love',
      duration: '2:08',
      url: 'https://archive.org/download/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Juice%20WRLD%20DRFL%20BTV%2012%20Syphilis.mp3',
      cover: 'https://ia600307.us.archive.org/20/items/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Death%20Race%20For%20Love%20%28Album%20Cover%29.jpg'
    },
    {
      id: '13',
      title: 'Who Shot Cupid?',
      artist: 'Juice WRLD',
      album: 'Death Race for Love',
      duration: '3:11',
      url: 'https://archive.org/download/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Juice%20WRLD%20DRFL%20BTV%2013%20Who%20Shot%20Cupid.mp3',
      cover: 'https://ia600307.us.archive.org/20/items/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Death%20Race%20For%20Love%20%28Album%20Cover%29.jpg'
    },
    {
      id: '14',
      title: 'Ring Ring (ft. Clever)',
      artist: 'Juice WRLD',
      album: 'Death Race for Love',
      duration: '2:38',
      url: 'https://archive.org/download/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Juice%20WRLD%20DRFL%20BTV%2014%20Ring%20Ring%20%28ft.%20Clever%29.mp3',
      cover: 'https://ia600307.us.archive.org/20/items/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Death%20Race%20For%20Love%20%28Album%20Cover%29.jpg'
    },
    {
      id: '15',
      title: 'Desire',
      artist: 'Juice WRLD',
      album: 'Death Race for Love',
      duration: '2:53',
      url: 'https://archive.org/download/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Juice%20WRLD%20DRFL%20BTV%2015%20Desire.mp3',
      cover: 'https://ia600307.us.archive.org/20/items/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Death%20Race%20For%20Love%20%28Album%20Cover%29.jpg'
    },
    {
      id: '16',
      title: 'Out My Way',
      artist: 'Juice WRLD',
      album: 'Death Race for Love',
      duration: '2:37',
      url: 'https://archive.org/download/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Juice%20WRLD%20DRFL%20BTV%2016%20Out%20My%20Way.mp3',
      cover: 'https://ia600307.us.archive.org/20/items/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Death%20Race%20For%20Love%20%28Album%20Cover%29.jpg'
    },
    {
      id: '17',
      title: 'The Bees Knees',
      artist: 'Juice WRLD',
      album: 'Death Race for Love',
      duration: '5:26',
      url: 'https://archive.org/download/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Juice%20WRLD%20DRFL%20BTV%2017%20The%20Bees%20Knees.mp3',
      cover: 'https://ia600307.us.archive.org/20/items/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Death%20Race%20For%20Love%20%28Album%20Cover%29.jpg'
    },
    {
      id: '18',
      title: 'ON GOD (ft. Young Thug)',
      artist: 'Juice WRLD',
      album: 'Death Race for Love',
      duration: '4:10',
      url: 'https://archive.org/download/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Juice%20WRLD%20DRFL%20BTV%2018%20ON%20GOD%20%28ft.%20Young%20Thug%29.mp3',
      cover: 'https://ia600307.us.archive.org/20/items/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Death%20Race%20For%20Love%20%28Album%20Cover%29.jpg'
    },
    {
      id: '19',
      title: '10 Feet',
      artist: 'Juice WRLD',
      album: 'Death Race for Love',
      duration: '3:32',
      url: 'https://archive.org/download/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Juice%20WRLD%20DRFL%20BTV%2019%2010%20Feet.mp3',
      cover: 'https://ia600307.us.archive.org/20/items/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Death%20Race%20For%20Love%20%28Album%20Cover%29.jpg'
    },
    {
      id: '20',
      title: "Won't Let Go",
      artist: 'Juice WRLD',
      album: 'Death Race for Love',
      duration: '3:20',
      url: 'https://archive.org/download/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Juice%20WRLD%20DRFL%20BTV%2020%20Won%27t%20Let%20Go.mp3',
      cover: 'https://ia600307.us.archive.org/20/items/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Death%20Race%20For%20Love%20%28Album%20Cover%29.jpg'
    },
    {
      id: '21',
      title: "She's the One",
      artist: 'Juice WRLD',
      album: 'Death Race for Love',
      duration: '3:09',
      url: 'https://archive.org/download/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Juice%20WRLD%20DRFL%20BTV%2021%20She%27s%20the%20One.mp3',
      cover: 'https://ia600307.us.archive.org/20/items/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Death%20Race%20For%20Love%20%28Album%20Cover%29.jpg'
    },
    {
      id: '22',
      title: 'Rider',
      artist: 'Juice WRLD',
      album: 'Death Race for Love',
      duration: '3:12',
      url: 'https://archive.org/download/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Juice%20WRLD%20DRFL%20BTV%2022%20Rider.mp3',
      cover: 'https://ia600307.us.archive.org/20/items/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Death%20Race%20For%20Love%20%28Album%20Cover%29.jpg'
    },
    {
      id: '23',
      title: 'Make Believe',
      artist: 'Juice WRLD',
      album: 'Death Race for Love',
      duration: '3:10',
      url: 'https://archive.org/download/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Juice%20WRLD%20DRFL%20BTV%2023%20Make%20Believe.mp3',
      cover: 'https://ia600307.us.archive.org/20/items/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Death%20Race%20For%20Love%20%28Album%20Cover%29.jpg'
    }
  ];

  const seventeenPlaylist: Track[] = [
    {
      id: '1',
      title: 'The Explanation',
      artist: 'XXXTentacion',
      album: '17',
      duration: '2:32',
      url: 'https://archive.org/download/xxxtentacion17/01.%20The%20Explanation.mp3',
      cover: 'https://i.ytimg.com/vi/ng0GKh-v0DQ/maxresdefault.jpg'
    },
    {
      id: '2',
      title: 'Jocelyn Flores',
      artist: 'XXXTentacion',
      album: '17',
      duration: '1:59',
      url: 'https://archive.org/download/xxxtentacion17/02.%20Jocelyn%20Flores.mp3',
      cover: 'https://i.ytimg.com/vi/ng0GKh-v0DQ/maxresdefault.jpg'
    },
    {
      id: '3',
      title: 'Depression & Obsession',
      artist: 'XXXTentacion',
      album: '17',
      duration: '1:36',
      url: 'https://archive.org/download/xxxtentacion17/03.%20Depression%20%26%20Obsession.mp3',
      cover: 'https://i.ytimg.com/vi/ng0GKh-v0DQ/maxresdefault.jpg'
    },
    {
      id: '4',
      title: 'Everybody Dies In Their Nightmares',
      artist: 'XXXTentacion',
      album: '17',
      duration: '1:35',
      url: 'https://archive.org/download/xxxtentacion17/04.%20Everybody%20Dies%20In%20Their%20Nightmares.mp3',
      cover: 'https://i.ytimg.com/vi/ng0GKh-v0DQ/maxresdefault.jpg'
    },
    {
      id: '5',
      title: 'Revenge',
      artist: 'XXXTentacion',
      album: '17',
      duration: '2:00',
      url: 'https://archive.org/download/xxxtentacion17/05.%20Revenge.mp3',
      cover: 'https://i.ytimg.com/vi/ng0GKh-v0DQ/maxresdefault.jpg'
    },
    {
      id: '6',
      title: 'Save Me',
      artist: 'XXXTentacion',
      album: '17',
      duration: '2:34',
      url: 'https://archive.org/download/xxxtentacion17/06.%20Save%20Me.mp3',
      cover: 'https://i.ytimg.com/vi/ng0GKh-v0DQ/maxresdefault.jpg'
    },
    {
      id: '7',
      title: 'Dead Inside (Interlude)',
      artist: 'XXXTentacion',
      album: '17',
      duration: '1:29',
      url: 'https://archive.org/download/xxxtentacion17/07.%20Dead%20Inside%20%28Interlude%29.mp3',
      cover: 'https://i.ytimg.com/vi/ng0GKh-v0DQ/maxresdefault.jpg'
    },
    {
      id: '8',
      title: 'Fuck Love',
      artist: 'XXXTentacion ft. Trippie Redd',
      album: '17',
      duration: '2:26',
      url: 'https://archive.org/download/xxxtentacion17/08.%20Fuck%20Love%20%28Ft.%20Trippie%20Redd%29.mp3',
      cover: 'https://i.ytimg.com/vi/ng0GKh-v0DQ/maxresdefault.jpg'
    },
    {
      id: '9',
      title: 'Carry On',
      artist: 'XXXTentacion',
      album: '17',
      duration: '2:24',
      url: 'https://archive.org/download/xxxtentacion17/09.%20Carry%20On.mp3',
      cover: 'https://i.ytimg.com/vi/ng0GKh-v0DQ/maxresdefault.jpg'
    },
    {
      id: '10',
      title: 'Orlando',
      artist: 'XXXTentacion',
      album: '17',
      duration: '2:01',
      url: 'https://archive.org/download/xxxtentacion17/10.%20Orlando.mp3',
      cover: 'https://i.ytimg.com/vi/ng0GKh-v0DQ/maxresdefault.jpg'
    },
    {
      id: '11',
      title: 'Ayala (Outro)',
      artist: 'XXXTentacion',
      album: '17',
      duration: '3:03',
      url: 'https://archive.org/download/xxxtentacion17/11.%20Ayala%20%28Outro%29.mp3',
      cover: 'https://i.ytimg.com/vi/ng0GKh-v0DQ/maxresdefault.jpg'
    }
  ];

  const questionPlaylist: Track[] = [
    {
      id: '1',
      title: 'Introduction (instructions)',
      artist: 'XXXTentacion',
      album: '?',
      duration: '1:23',
      url: 'https://archive.org/download/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/01%20-%20Xxxtentacion%20-%20Introduction%20%28Instructions%29.mp3',
      cover: 'https://ia801501.us.archive.org/0/items/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/huh.jpeg'
    },
    {
      id: '2',
      title: 'ALONE, PART 3',
      artist: 'XXXTentacion',
      album: '?',
      duration: '2:17',
      url: 'https://archive.org/download/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/02%20-%20Xxxtentacion%20-%20Alone%2C%20Part%203.mp3',
      cover: 'https://ia801501.us.archive.org/0/items/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/huh.jpeg'
    },
    {
      id: '3',
      title: 'Moonlight',
      artist: 'XXXTentacion',
      album: '?',
      duration: '2:14',
      url: 'https://archive.org/download/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/03%20-%20Xxxtentacion%20-%20Moonlight.mp3',
      cover: 'https://ia801501.us.archive.org/0/items/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/huh.jpeg'
    },
    {
      id: '4',
      title: 'SAD!',
      artist: 'XXXTentacion',
      album: '?',
      duration: '2:46',
      url: 'https://archive.org/download/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/04%20-%20Xxxtentacion%20-%20Sad%21.mp3',
      cover: 'https://ia801501.us.archive.org/0/items/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/huh.jpeg'
    },
    {
      id: '5',
      title: 'the remedy for a broken heart (why am I so in love)',
      artist: 'XXXTentacion',
      album: '?',
      duration: '2:40',
      url: 'https://archive.org/download/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/05%20-%20Xxxtentacion%20-%20The%20Remedy%20For%20A%20Broken%20Heart%20%28Why%20Am%20I%20So%20In%20Love%29.mp3',
      cover: 'https://ia801501.us.archive.org/0/items/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/huh.jpeg'
    },
    {
      id: '6',
      title: 'Floor 555',
      artist: 'XXXTentacion',
      album: '?',
      duration: '1:27',
      url: 'https://archive.org/download/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/06%20-%20Xxxtentacion%20-%20Floor%20555.mp3',
      cover: 'https://ia801501.us.archive.org/0/items/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/huh.jpeg'
    },
    {
      id: '7',
      title: 'numb',
      artist: 'XXXTentacion',
      album: '?',
      duration: '3:22',
      url: 'https://archive.org/download/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/07%20-%20Xxxtentacion%20-%20Numb.mp3',
      cover: 'https://ia801501.us.archive.org/0/items/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/huh.jpeg'
    },
    {
      id: '8',
      title: 'infinity (888)',
      artist: 'XXXTentacion feat. Joey Bada$$',
      album: '?',
      duration: '3:22',
      url: 'https://archive.org/download/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/08%20-%20Xxxtentacion%20Feat.%20Joey%20Bada%24%24%20-%20Infinity%20%28888%29.mp3',
      cover: 'https://ia801501.us.archive.org/0/items/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/huh.jpeg'
    },
    {
      id: '9',
      title: 'going down!',
      artist: 'XXXTentacion',
      album: '?',
      duration: '2:13',
      url: 'https://archive.org/download/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/09%20-%20Xxxtentacion%20-%20Going%20Down%21.mp3',
      cover: 'https://ia801501.us.archive.org/0/items/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/huh.jpeg'
    },
    {
      id: '10',
      title: 'Pain = BESTFRIEND',
      artist: 'XXXTentacion feat. Travis Barker',
      album: '?',
      duration: '1:51',
      url: 'https://archive.org/download/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/10%20-%20Xxxtentacion%20Feat.%20Travis%20Barker%20-%20Pain%20%3D%20Bestfriend.mp3',
      cover: 'https://ia801501.us.archive.org/0/items/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/huh.jpeg'
    },
    {
      id: '11',
      title: '$$$',
      artist: 'XXXTentacion & Matt Ox',
      album: '?',
      duration: '2:33',
      url: 'https://archive.org/download/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/11%20-%20Xxxtentacion%20%26%20Matt%20Ox%20-%20%24%24%24.mp3',
      cover: 'https://ia801501.us.archive.org/0/items/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/huh.jpeg'
    },
    {
      id: '12',
      title: 'love yourself (interlude)',
      artist: 'XXXTentacion',
      album: '?',
      duration: '0:54',
      url: 'https://archive.org/download/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/12%20-%20Xxxtentacion%20-%20Love%20Yourself%20%28Interlude%29.mp3',
      cover: 'https://ia801501.us.archive.org/0/items/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/huh.jpeg'
    },
    {
      id: '13',
      title: 'SMASH!',
      artist: 'XXXTentacion feat. PnB Rock',
      album: '?',
      duration: '2:07',
      url: 'https://archive.org/download/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/13%20-%20Xxxtentacion%20feat.%20Pnb%20Rock%20-%20Smash%21.mp3',
      cover: 'https://ia801501.us.archive.org/0/items/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/huh.jpeg'
    },
    {
      id: '14',
      title: 'I don\'t even speak spanish lol',
      artist: 'XXXTentacion feat. Rio Santana, Judah, Carlos Andrez',
      album: '?',
      duration: '3:34',
      url: 'https://archive.org/download/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/14%20-%20Xxxtentacion%20Feat.%20Rio%20Santana%2C%20Judah%2C%20Carlos%20Andrez%20-%20I%20Don%E2%80%99t%20Even%20Speak%20Spanish%20Lol.mp3',
      cover: 'https://ia801501.us.archive.org/0/items/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/huh.jpeg'
    },
    {
      id: '15',
      title: 'changes',
      artist: 'XXXTentacion',
      album: '?',
      duration: '2:02',
      url: 'https://archive.org/download/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/15%20-%20Xxxtentacion%20-%20Changes.mp3',
      cover: 'https://ia801501.us.archive.org/0/items/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/huh.jpeg'
    },
    {
      id: '16',
      title: 'hope',
      artist: 'XXXTentacion',
      album: '?',
      duration: '1:51',
      url: 'https://archive.org/download/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/16%20-%20Xxxtentacion%20-%20Hope.mp3',
      cover: 'https://ia801501.us.archive.org/0/items/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/huh.jpeg'
    },
    {
      id: '17',
      title: 'schizophrenia',
      artist: 'XXXTentacion',
      album: '?',
      duration: '1:27',
      url: 'https://archive.org/download/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/17%20-%20Xxxtentacion%20-%20Schizophrenia.mp3',
      cover: 'https://ia801501.us.archive.org/0/items/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/huh.jpeg'
    },
    {
      id: '18',
      title: 'before i close my eyes',
      artist: 'XXXTentacion',
      album: '?',
      duration: '1:39',
      url: 'https://archive.org/download/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/18%20-%20Xxxtentacion%20-%20Before%20I%20Close%20My%20Eyes.mp3',
      cover: 'https://ia801501.us.archive.org/0/items/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/huh.jpeg'
    }
  ];

  const gbgrPlaylist: Track[] = [
    {
      id: '1',
      title: 'Intro',
      artist: 'Juice WRLD',
      album: 'Goodbye & Good Riddance',
      duration: '1:18',
      url: 'https://archive.org/download/goodbyegoodriddance/Goodbye%20%26%20Good%20Riddance%20%28Anniversary%20Edition%29/Intro.mp3.mp3',
      cover: 'https://e1.pxfuel.com/desktop-wallpaper/406/974/desktop-wallpaper-gbgr-juice-wrld-goodbye-good-riddance.jpg'
    },
    {
      id: '2',
      title: 'All Girls Are The Same',
      artist: 'Juice WRLD',
      album: 'Goodbye & Good Riddance',
      duration: '2:45',
      url: 'https://archive.org/download/goodbyegoodriddance/Goodbye%20%26%20Good%20Riddance%20%28Anniversary%20Edition%29/All%20Girls%20Are%20The%20Same.mp3.mp3',
      cover: 'https://e1.pxfuel.com/desktop-wallpaper/406/974/desktop-wallpaper-gbgr-juice-wrld-goodbye-good-riddance.jpg'
    },
    {
      id: '3',
      title: 'Lucid Dreams',
      artist: 'Juice WRLD',
      album: 'Goodbye & Good Riddance',
      duration: '3:59',
      url: 'https://archive.org/download/goodbyegoodriddance/Goodbye%20%26%20Good%20Riddance%20%28Anniversary%20Edition%29/Lucid%20Dreams.mp3.mp3',
      cover: 'https://e1.pxfuel.com/desktop-wallpaper/406/974/desktop-wallpaper-gbgr-juice-wrld-goodbye-good-riddance.jpg'
    },
    {
      id: '4',
      title: 'Lean Wit Me',
      artist: 'Juice WRLD',
      album: 'Goodbye & Good Riddance',
      duration: '2:55',
      url: 'https://archive.org/download/goodbyegoodriddance/Goodbye%20%26%20Good%20Riddance%20%28Anniversary%20Edition%29/Lean%20Wit%20Me.mp3.mp3',
      cover: 'https://e1.pxfuel.com/desktop-wallpaper/406/974/desktop-wallpaper-gbgr-juice-wrld-goodbye-good-riddance.jpg'
    },
    {
      id: '5',
      title: 'Wasted (feat. Lil Uzi Vert)',
      artist: 'Juice WRLD',
      album: 'Goodbye & Good Riddance',
      duration: '4:19',
      url: 'https://archive.org/download/goodbyegoodriddance/Goodbye%20%26%20Good%20Riddance%20%28Anniversary%20Edition%29/Wasted%20%28feat.%20Lil%20Uzi%20Vert%29.mp3.mp3',
      cover: 'https://e1.pxfuel.com/desktop-wallpaper/406/974/desktop-wallpaper-gbgr-juice-wrld-goodbye-good-riddance.jpg'
    },
    {
      id: '6',
      title: '734',
      artist: 'Juice WRLD',
      album: 'Goodbye & Good Riddance',
      duration: '3:19',
      url: 'https://archive.org/download/goodbyegoodriddance/Goodbye%20%26%20Good%20Riddance%20%28Anniversary%20Edition%29/734.mp3.mp3',
      cover: 'https://e1.pxfuel.com/desktop-wallpaper/406/974/desktop-wallpaper-gbgr-juice-wrld-goodbye-good-riddance.jpg'
    },
    {
      id: '7',
      title: 'Black & White',
      artist: 'Juice WRLD',
      album: 'Goodbye & Good Riddance',
      duration: '3:06',
      url: 'https://archive.org/download/goodbyegoodriddance/Goodbye%20%26%20Good%20Riddance%20%28Anniversary%20Edition%29/Black%20%26%20White.mp3.mp3',
      cover: 'https://e1.pxfuel.com/desktop-wallpaper/406/974/desktop-wallpaper-gbgr-juice-wrld-goodbye-good-riddance.jpg'
    },
    {
      id: '8',
      title: 'Betrayal (Skit)',
      artist: 'Juice WRLD',
      album: 'Goodbye & Good Riddance',
      duration: '1:11',
      url: 'https://archive.org/download/goodbyegoodriddance/Goodbye%20%26%20Good%20Riddance%20%28Anniversary%20Edition%29/Betrayal%20%28Skit%29.mp3.mp3',
      cover: 'https://e1.pxfuel.com/desktop-wallpaper/406/974/desktop-wallpaper-gbgr-juice-wrld-goodbye-good-riddance.jpg'
    },
    {
      id: '9',
      title: 'Scared Of Love',
      artist: 'Juice WRLD',
      album: 'Goodbye & Good Riddance',
      duration: '2:51',
      url: 'https://archive.org/download/goodbyegoodriddance/Goodbye%20%26%20Good%20Riddance%20%28Anniversary%20Edition%29/Scared%20Of%20Love.mp3.mp3',
      cover: 'https://e1.pxfuel.com/desktop-wallpaper/406/974/desktop-wallpaper-gbgr-juice-wrld-goodbye-good-riddance.jpg'
    },
    {
      id: '10',
      title: 'Hurt Me',
      artist: 'Juice WRLD',
      album: 'Goodbye & Good Riddance',
      duration: '2:08',
      url: 'https://archive.org/download/goodbyegoodriddance/Goodbye%20%26%20Good%20Riddance%20%28Anniversary%20Edition%29/Hurt%20Me.mp3.mp3',
      cover: 'https://e1.pxfuel.com/desktop-wallpaper/406/974/desktop-wallpaper-gbgr-juice-wrld-goodbye-good-riddance.jpg'
    },
    {
      id: '11',
      title: 'Used To',
      artist: 'Juice WRLD',
      album: 'Goodbye & Good Riddance',
      duration: '2:59',
      url: 'https://archive.org/download/goodbyegoodriddance/Goodbye%20%26%20Good%20Riddance%20%28Anniversary%20Edition%29/Used%20To.mp3.mp3',
      cover: 'https://e1.pxfuel.com/desktop-wallpaper/406/974/desktop-wallpaper-gbgr-juice-wrld-goodbye-good-riddance.jpg'
    },
    {
      id: '12',
      title: 'Candles',
      artist: 'Juice WRLD',
      album: 'Goodbye & Good Riddance',
      duration: '3:06',
      url: 'https://archive.org/download/goodbyegoodriddance/Goodbye%20%26%20Good%20Riddance%20%28Anniversary%20Edition%29/Candles.mp3.mp3',
      cover: 'https://e1.pxfuel.com/desktop-wallpaper/406/974/desktop-wallpaper-gbgr-juice-wrld-goodbye-good-riddance.jpg'
    },
    {
      id: '13',
      title: 'Long Gone',
      artist: 'Juice WRLD',
      album: 'Goodbye & Good Riddance',
      duration: '3:08',
      url: 'https://archive.org/download/goodbyegoodriddance/Goodbye%20%26%20Good%20Riddance%20%28Anniversary%20Edition%29/Long%20Gone.mp3.mp3',
      cover: 'https://e1.pxfuel.com/desktop-wallpaper/406/974/desktop-wallpaper-gbgr-juice-wrld-goodbye-good-riddance.jpg'
    },
    {
      id: '14',
      title: 'End Of The Road',
      artist: 'Juice WRLD',
      album: 'Goodbye & Good Riddance',
      duration: '2:47',
      url: 'https://archive.org/download/goodbyegoodriddance/Goodbye%20%26%20Good%20Riddance%20%28Anniversary%20Edition%29/End%20Of%20The%20Road.mp3.mp3',
      cover: 'https://e1.pxfuel.com/desktop-wallpaper/406/974/desktop-wallpaper-gbgr-juice-wrld-goodbye-good-riddance.jpg'
    },
    {
      id: '15',
      title: 'I\'ll Be Fine',
      artist: 'Juice WRLD',
      album: 'Goodbye & Good Riddance',
      duration: '4:04',
      url: 'https://archive.org/download/goodbyegoodriddance/Goodbye%20%26%20Good%20Riddance%20%28Anniversary%20Edition%29/I%27ll%20Be%20Fine.mp3.mp3',
      cover: 'https://e1.pxfuel.com/desktop-wallpaper/406/974/desktop-wallpaper-gbgr-juice-wrld-goodbye-good-riddance.jpg'
    },
    {
      id: '16',
      title: 'I\'m Still',
      artist: 'Juice WRLD',
      album: 'Goodbye & Good Riddance',
      duration: '3:14',
      url: 'https://archive.org/download/goodbyegoodriddance/Goodbye%20%26%20Good%20Riddance%20%28Anniversary%20Edition%29/I%27m%20Still.mp3.mp3',
      cover: 'https://e1.pxfuel.com/desktop-wallpaper/406/974/desktop-wallpaper-gbgr-juice-wrld-goodbye-good-riddance.jpg'
    },
    {
      id: '17',
      title: 'Karma (Skit)',
      artist: 'Juice WRLD',
      album: 'Goodbye & Good Riddance',
      duration: '1:17',
      url: 'https://archive.org/download/goodbyegoodriddance/Goodbye%20%26%20Good%20Riddance%20%28Anniversary%20Edition%29/Karma%20%28Skit%29.mp3.mp3',
      cover: 'https://e1.pxfuel.com/desktop-wallpaper/406/974/desktop-wallpaper-gbgr-juice-wrld-goodbye-good-riddance.jpg'
    },
    {
      id: '18',
      title: 'Lucid Dreams (Remix) ft. Lil Uzi Vert',
      artist: 'Juice WRLD',
      album: 'Goodbye & Good Riddance',
      duration: '3:59',
      url: 'https://archive.org/download/goodbyegoodriddance/Goodbye%20%26%20Good%20Riddance%20%28Anniversary%20Edition%29/Lucid%20Dreams%20%28Remix%29%20ft.%20Lil%20Uzi%20Vert.mp3.mp3',
      cover: 'https://e1.pxfuel.com/desktop-wallpaper/406/974/desktop-wallpaper-gbgr-juice-wrld-goodbye-good-riddance.jpg'
    }
  ];

  const lndPlaylist: Track[] = [
    {
      id: '1',
      title: 'Anxiety (Intro)',
      artist: 'Juice WRLD',
      album: 'Legends Never Die',
      duration: '1:37',
      url: 'https://archive.org/download/juice-wrld-legends-never-die/Legends%20Never%20Die%20%282020%29/Juice%20WRLD%20LND%2001%20Anxiety%20%28Intro%29.mp3',
      cover: 'https://wallpaperaccess.com/full/6302625.png'
    },
    {
      id: '2',
      title: 'Conversations',
      artist: 'Juice WRLD',
      album: 'Legends Never Die',
      duration: '3:24',
      url: 'https://archive.org/download/juice-wrld-legends-never-die/Legends%20Never%20Die%20%282020%29/Juice%20WRLD%20LND%2002%20Conversations.mp3',
      cover: 'https://wallpaperaccess.com/full/6302625.png'
    },
    {
      id: '3',
      title: 'Titanic',
      artist: 'Juice WRLD',
      album: 'Legends Never Die',
      duration: '3:19',
      url: 'https://archive.org/download/juice-wrld-legends-never-die/Legends%20Never%20Die%20%282020%29/Juice%20WRLD%20LND%2003%20Titanic.mp3',
      cover: 'https://wallpaperaccess.com/full/6302625.png'
    },
    {
      id: '4',
      title: 'Bad Energy',
      artist: 'Juice WRLD',
      album: 'Legends Never Die',
      duration: '3:30',
      url: 'https://archive.org/download/juice-wrld-legends-never-die/Legends%20Never%20Die%20%282020%29/Juice%20WRLD%20LND%2004%20Bad%20Energy%29.mp3',
      cover: 'https://wallpaperaccess.com/full/6302625.png'
    },
    {
      id: '5',
      title: 'Righteous',
      artist: 'Juice WRLD',
      album: 'Legends Never Die',
      duration: '4:23',
      url: 'https://archive.org/download/juice-wrld-legends-never-die/Legends%20Never%20Die%20%282020%29/Juice%20WRLD%20LND%2005%20Righteous.mp3',
      cover: 'https://wallpaperaccess.com/full/6302625.png'
    },
    {
      id: '6',
      title: 'Blood On My Jeans',
      artist: 'Juice WRLD',
      album: 'Legends Never Die',
      duration: '2:59',
      url: 'https://archive.org/download/juice-wrld-legends-never-die/Legends%20Never%20Die%20%282020%29/Juice%20WRLD%20LND%2006%20Blood%20On%20My%20Jeans.mp3',
      cover: 'https://wallpaperaccess.com/full/6302625.png'
    },
    {
      id: '7',
      title: 'Tell Me U Luv Me (with Trippie Redd)',
      artist: 'Juice WRLD',
      album: 'Legends Never Die',
      duration: '3:25',
      url: 'https://archive.org/download/juice-wrld-legends-never-die/Legends%20Never%20Die%20%282020%29/Juice%20WRLD%20LND%2007%20Tell%20Me%20U%20Luv%20Me.mp3',
      cover: 'https://wallpaperaccess.com/full/6302625.png'
    },
    {
      id: '8',
      title: 'Hate The Other Side (ft. Marshmello, Polo G & The Kid LAROI)',
      artist: 'Juice WRLD',
      album: 'Legends Never Die',
      duration: '3:05',
      url: 'https://archive.org/download/juice-wrld-legends-never-die/Legends%20Never%20Die%20%282020%29/Juice%20WRLD%20LND%2008%20Hate%20the%20Other%20Side.mp3',
      cover: 'https://wallpaperaccess.com/full/6302625.png'
    },
    {
      id: '9',
      title: 'Get Through It (Interlude)',
      artist: 'Juice WRLD',
      album: 'Legends Never Die',
      duration: '0:49',
      url: 'https://archive.org/download/juice-wrld-legends-never-die/Legends%20Never%20Die%20%282020%29/Juice%20WRLD%20LND%2009%20Get%20Through%20It%20%28Interlude%29.mp3',
      cover: 'https://wallpaperaccess.com/full/6302625.png'
    },
    {
      id: '10',
      title: 'Life\'s A Mess (with Hasley)',
      artist: 'Juice WRLD',
      album: 'Legends Never Die',
      duration: '3:46',
      url: 'https://archive.org/download/juice-wrld-legends-never-die/Legends%20Never%20Die%20%282020%29/Juice%20WRLD%20LND%2010%20Life%27s%20a%20Mess.mp3',
      cover: 'https://wallpaperaccess.com/full/6302625.png'
    },
    {
      id: '11',
      title: 'Come & Go (with Marshmello)',
      artist: 'Juice WRLD',
      album: 'Legends Never Die',
      duration: '3:47',
      url: 'https://archive.org/download/juice-wrld-legends-never-die/Legends%20Never%20Die%20%282020%29/Juice%20WRLD%20LND%2011%20Come%20%26%20Go.mp3',
      cover: 'https://wallpaperaccess.com/full/6302625.png'
    },
    {
      id: '12',
      title: 'I Want It',
      artist: 'Juice WRLD',
      album: 'Legends Never Die',
      duration: '3:17',
      url: 'https://archive.org/download/juice-wrld-legends-never-die/Legends%20Never%20Die%20%282020%29/Juice%20WRLD%20LND%2012%20I%20Want%20It.mp3',
      cover: 'https://wallpaperaccess.com/full/6302625.png'
    },
    {
      id: '13',
      title: 'Fighting Demons',
      artist: 'Juice WRLD',
      album: 'Legends Never Die',
      duration: '3:42',
      url: 'https://archive.org/download/juice-wrld-legends-never-die/Legends%20Never%20Die%20%282020%29/Juice%20WRLD%20LND%2013%20Fighting%20Demons.mp3',
      cover: 'https://wallpaperaccess.com/full/6302625.png'
    },
    {
      id: '14',
      title: 'Wishing Well',
      artist: 'Juice WRLD',
      album: 'Legends Never Die',
      duration: '3:37',
      url: 'https://archive.org/download/juice-wrld-legends-never-die/Legends%20Never%20Die%20%282020%29/Juice%20WRLD%20LND%2014%20Wishing%20Well.mp3',
      cover: 'https://wallpaperaccess.com/full/6302625.png'
    },
    {
      id: '15',
      title: 'Screw Juice',
      artist: 'Juice WRLD',
      album: 'Legends Never Die',
      duration: '3:22',
      url: 'https://archive.org/download/juice-wrld-legends-never-die/Legends%20Never%20Die%20%282020%29/Juice%20WRLD%20LND%2015%20Screw%20Juice.mp3',
      cover: 'https://wallpaperaccess.com/full/6302625.png'
    },
    {
      id: '16',
      title: 'Up Up And Away',
      artist: 'Juice WRLD',
      album: 'Legends Never Die',
      duration: '2:51',
      url: 'https://archive.org/download/juice-wrld-legends-never-die/Legends%20Never%20Die%20%282020%29/Juice%20WRLD%20LND%2016%20Up%20Up%20and%20Away.mp3',
      cover: 'https://wallpaperaccess.com/full/6302625.png'
    },
    {
      id: '17',
      title: 'The Man, The Myth, The Legend (Interlude)',
      artist: 'Juice WRLD',
      album: 'Legends Never Die',
      duration: '2:41',
      url: 'https://archive.org/download/juice-wrld-legends-never-die/Legends%20Never%20Die%20%282020%29/Juice%20WRLD%20LND%2017%20The%20Man%2C%20The%20Myth%2C%20The%20Legend.mp3',
      cover: 'https://wallpaperaccess.com/full/6302625.png'
    },
    {
      id: '18',
      title: 'Stay High',
      artist: 'Juice WRLD',
      album: 'Legends Never Die',
      duration: '3:12',
      url: 'https://archive.org/download/juice-wrld-legends-never-die/Legends%20Never%20Die%20%282020%29/Juice%20WRLD%20LND%2018%20Stay%20High.mp3',
      cover: 'https://wallpaperaccess.com/full/6302625.png'
    },
    {
      id: '19',
      title: 'Can\'t Die',
      artist: 'Juice WRLD',
      album: 'Legends Never Die',
      duration: '3:27',
      url: 'https://archive.org/download/juice-wrld-legends-never-die/Legends%20Never%20Die%20%282020%29/Juice%20WRLD%20LND%2019%20Can%27t%20Die.mp3',
      cover: 'https://wallpaperaccess.com/full/6302625.png'
    },
    {
      id: '20',
      title: 'Man Of The Year',
      artist: 'Juice WRLD',
      album: 'Legends Never Die',
      duration: '2:41',
      url: 'https://archive.org/download/juice-wrld-legends-never-die/Legends%20Never%20Die%20%282020%29/Juice%20WRLD%20LND%2020%20Man%20of%20the%20Year.mp3',
      cover: 'https://wallpaperaccess.com/full/6302625.png'
    },
    {
      id: '21',
      title: 'Juice WRLD Speaks From Heaven (Outro)',
      artist: 'Juice WRLD',
      album: 'Legends Never Die',
      duration: '0:59',
      url: 'https://archive.org/download/juice-wrld-legends-never-die/Legends%20Never%20Die%20%282020%29/Juice%20WRLD%20LND%2021%20Juice%20WRLD%20Speaks%20from%20Heaven.mp3',
      cover: 'https://wallpaperaccess.com/full/6302625.png'
    }
  ];

  const yePlaylist: Track[] = [
    {
      id: '1',
      title: 'I Thought About Killing You',
      artist: 'Kanye West',
      album: 'ye',
      duration: '7:04',
      url: 'https://archive.org/download/ihbbpia-cd-rip/01%20I%20Thought%20About%20Killing%20You.m4a',
      cover: 'https://wallpaperaccess.com/full/4198173.jpg'
    },
    {
      id: '2',
      title: 'Yikes',
      artist: 'Kanye West',
      album: 'ye',
      duration: '3:10',
      url: 'https://archive.org/download/ihbbpia-cd-rip/02%20Yikes.m4a',
      cover: 'https://wallpaperaccess.com/full/4198173.jpg'
    },
    {
      id: '3',
      title: 'All Mine',
      artist: 'Kanye West',
      album: 'ye',
      duration: '2:25',
      url: 'https://archive.org/download/ihbbpia-cd-rip/03%20All%20Mine.m4a',
      cover: 'https://wallpaperaccess.com/full/4198173.jpg'
    },
    {
      id: '4',
      title: 'Wouldn\'t Leave',
      artist: 'Kanye West',
      album: 'ye',
      duration: '3:20',
      url: 'https://archive.org/download/ihbbpia-cd-rip/04%20Wouldn%27t%20Leave.m4a',
      cover: 'https://wallpaperaccess.com/full/4198173.jpg'
    },
    {
      id: '5',
      title: 'No Mistakes',
      artist: 'Kanye West',
      album: 'ye',
      duration: '2:03',
      url: 'https://archive.org/download/ihbbpia-cd-rip/05%20No%20Mistakes.m4a',
      cover: 'https://wallpaperaccess.com/full/4198173.jpg'
    },
    {
      id: '6',
      title: 'Ghost Town',
      artist: 'Kanye West',
      album: 'ye',
      duration: '5:39',
      url: 'https://archive.org/download/ihbbpia-cd-rip/06%20Ghost%20Town.m4a',
      cover: 'https://wallpaperaccess.com/full/4198173.jpg'
    },
    {
      id: '7',
      title: 'Violent Crimes',
      artist: 'Kanye West',
      album: 'ye',
      duration: '3:17',
      url: 'https://archive.org/download/ihbbpia-cd-rip/07%20Violent%20Crimes.m4a',
      cover: 'https://wallpaperaccess.com/full/4198173.jpg'
    }
  ];

  const yeezusPlaylist: Track[] = [
    {
      id: '1',
      title: 'On Sight',
      artist: 'Kanye West',
      album: 'Yeezus',
      duration: '2:35',
      url: 'https://archive.org/download/yeezus_202406/01.%20Kanye%20West%20-%20On%20Sight.mp3',
      cover: 'https://image-cdn.hypb.st/https://hypebeast.com/wp-content/blogs.dir/4/files/2013/06/kanye-west-yeezus-official-album-artwork-0.jpg'
    },
    {
      id: '2',
      title: 'Black Skinhead',
      artist: 'Kanye West',
      album: 'Yeezus',
      duration: '3:08',
      url: 'https://archive.org/download/yeezus_202406/02.%20Kanye%20West%20-%20Black%20Skinhead.mp3',
      cover: 'https://image-cdn.hypb.st/https://hypebeast.com/wp-content/blogs.dir/4/files/2013/06/kanye-west-yeezus-official-album-artwork-0.jpg'
    },
    {
      id: '3',
      title: 'I Am A God',
      artist: 'Kanye West',
      album: 'Yeezus',
      duration: '3:51',
      url: 'https://archive.org/download/yeezus_202406/03.%20Kanye%20West%20-%20I%20Am%20A%20God.mp3',
      cover: 'https://image-cdn.hypb.st/https://hypebeast.com/wp-content/blogs.dir/4/files/2013/06/kanye-west-yeezus-official-album-artwork-0.jpg'
    },
    {
      id: '4',
      title: 'New Slaves',
      artist: 'Kanye West',
      album: 'Yeezus',
      duration: '4:16',
      url: 'https://archive.org/download/yeezus_202406/04.%20Kanye%20West%20-%20New%20Slaves.mp3',
      cover: 'https://image-cdn.hypb.st/https://hypebeast.com/wp-content/blogs.dir/4/files/2013/06/kanye-west-yeezus-official-album-artwork-0.jpg'
    },
    {
      id: '5',
      title: 'Hold My Liquor',
      artist: 'Kanye West',
      album: 'Yeezus',
      duration: '5:27',
      url: 'https://archive.org/download/yeezus_202406/05.%20Kanye%20West%20-%20Hold%20My%20Liquor.mp3',
      cover: 'https://image-cdn.hypb.st/https://hypebeast.com/wp-content/blogs.dir/4/files/2013/06/kanye-west-yeezus-official-album-artwork-0.jpg'
    },
    {
      id: '6',
      title: 'I\'m In It',
      artist: 'Kanye West',
      album: 'Yeezus',
      duration: '3:54',
      url: 'https://archive.org/download/yeezus_202406/06.%20Kanye%20West%20-%20I%27m%20In%20It.mp3',
      cover: 'https://image-cdn.hypb.st/https://hypebeast.com/wp-content/blogs.dir/4/files/2013/06/kanye-west-yeezus-official-album-artwork-0.jpg'
    },
    {
      id: '7',
      title: 'Blood On The Leaves',
      artist: 'Kanye West',
      album: 'Yeezus',
      duration: '6:00',
      url: 'https://archive.org/download/yeezus_202406/07.%20Kanye%20West%20-%20Blood%20On%20The%20Leaves.mp3',
      cover: 'https://image-cdn.hypb.st/https://hypebeast.com/wp-content/blogs.dir/4/files/2013/06/kanye-west-yeezus-official-album-artwork-0.jpg'
    },
    {
      id: '8',
      title: 'Guilt Trip',
      artist: 'Kanye West',
      album: 'Yeezus',
      duration: '4:03',
      url: 'https://archive.org/download/yeezus_202406/08.%20Kanye%20West%20-%20Guilt%20Trip.mp3',
      cover: 'https://image-cdn.hypb.st/https://hypebeast.com/wp-content/blogs.dir/4/files/2013/06/kanye-west-yeezus-official-album-artwork-0.jpg'
    },
    {
      id: '9',
      title: 'Send It Up',
      artist: 'Kanye West',
      album: 'Yeezus',
      duration: '2:58',
      url: 'https://archive.org/download/yeezus_202406/09.%20Kanye%20West%20-%20Send%20It%20Up.mp3',
      cover: 'https://image-cdn.hypb.st/https://hypebeast.com/wp-content/blogs.dir/4/files/2013/06/kanye-west-yeezus-official-album-artwork-0.jpg'
    },
    {
      id: '10',
      title: 'Bound 2',
      artist: 'Kanye West',
      album: 'Yeezus',
      duration: '3:49',
      url: 'https://archive.org/download/yeezus_202406/10.%20Kanye%20West%20-%20Bound%202.mp3',
      cover: 'https://image-cdn.hypb.st/https://hypebeast.com/wp-content/blogs.dir/4/files/2013/06/kanye-west-yeezus-official-album-artwork-0.jpg'
    }
  ];

  const moreChaosPlaylist: Track[] = [
    {
      id: '1',
      title: 'Lord Of Chaos',
      artist: 'Ken Carson',
      album: 'More Chaos',
      duration: '2:48',
      url: 'https://archive.org/download/more-chaos-24bit-flac-tidal-rip/01%20Lord%20Of%20Chaos.mp3',
      cover: 'https://ia601900.us.archive.org/22/items/more-chaos-24bit-flac-tidal-rip/MORECHAOS.jpg'
    },
    {
      id: '2',
      title: 'Xposed',
      artist: 'Ken Carson',
      album: 'More Chaos',
      duration: '5:39',
      url: 'https://archive.org/download/more-chaos-24bit-flac-tidal-rip/02%20Xposed.mp3',
      cover: 'https://ia601900.us.archive.org/22/items/more-chaos-24bit-flac-tidal-rip/MORECHAOS.jpg'
    },
    {
      id: '3',
      title: 'Money Spread',
      artist: 'Ken Carson',
      album: 'More Chaos',
      duration: '2:36',
      url: 'https://archive.org/download/more-chaos-24bit-flac-tidal-rip/03%20Money%20Spread.mp3',
      cover: 'https://ia601900.us.archive.org/22/items/more-chaos-24bit-flac-tidal-rip/MORECHAOS.jpg'
    },
    {
      id: '4',
      title: 'Root Of All Evil',
      artist: 'Ken Carson',
      album: 'More Chaos',
      duration: '3:27',
      url: 'https://archive.org/download/more-chaos-24bit-flac-tidal-rip/04%20Root%20Of%20All%20Evil.mp3',
      cover: 'https://ia601900.us.archive.org/22/items/more-chaos-24bit-flac-tidal-rip/MORECHAOS.jpg'
    },
    {
      id: '5',
      title: 'K-Hole',
      artist: 'Ken Carson',
      album: 'More Chaos',
      duration: '4:52',
      url: 'https://archive.org/download/more-chaos-24bit-flac-tidal-rip/05%20K-Hole.mp3',
      cover: 'https://ia601900.us.archive.org/22/items/more-chaos-24bit-flac-tidal-rip/MORECHAOS.jpg'
    },
    {
      id: '6',
      title: 'Trap Jump',
      artist: 'Ken Carson',
      album: 'More Chaos',
      duration: '3:31',
      url: 'https://archive.org/download/more-chaos-24bit-flac-tidal-rip/06%20Trap%20Jump.mp3',
      cover: 'https://ia601900.us.archive.org/22/items/more-chaos-24bit-flac-tidal-rip/MORECHAOS.jpg'
    },
    {
      id: '7',
      title: 'Blakk Rokkstar',
      artist: 'Ken Carson',
      album: 'More Chaos',
      duration: '5:31',
      url: 'https://archive.org/download/more-chaos-24bit-flac-tidal-rip/07%20Blakk%20Rokkstar.mp3',
      cover: 'https://ia601900.us.archive.org/22/items/more-chaos-24bit-flac-tidal-rip/MORECHAOS.jpg'
    },
    {
      id: '8',
      title: 'LiveLeak',
      artist: 'Ken Carson',
      album: 'More Chaos',
      duration: '4:37',
      url: 'https://archive.org/download/more-chaos-24bit-flac-tidal-rip/08%20LiveLeak.mp3',
      cover: 'https://ia601900.us.archive.org/22/items/more-chaos-24bit-flac-tidal-rip/MORECHAOS.jpg'
    },
    {
      id: '9',
      title: 'Diamonds',
      artist: 'Ken Carson',
      album: 'More Chaos',
      duration: '5:37',
      url: 'https://archive.org/download/more-chaos-24bit-flac-tidal-rip/09%20Diamonds.mp3',
      cover: 'https://ia601900.us.archive.org/22/items/more-chaos-24bit-flac-tidal-rip/MORECHAOS.jpg'
    },
    {
      id: '10',
      title: 'Dismantled',
      artist: 'Ken Carson',
      album: 'More Chaos',
      duration: '3:37',
      url: 'https://archive.org/download/more-chaos-24bit-flac-tidal-rip/10%20Dismantled.mp3',
      cover: 'https://ia601900.us.archive.org/22/items/more-chaos-24bit-flac-tidal-rip/MORECHAOS.jpg'
    },
    {
      id: '11',
      title: '200 Kash',
      artist: 'Ken Carson',
      album: 'More Chaos',
      duration: '2:25',
      url: 'https://archive.org/download/more-chaos-24bit-flac-tidal-rip/11%20200%20Kash.mp3',
      cover: 'https://ia601900.us.archive.org/22/items/more-chaos-24bit-flac-tidal-rip/MORECHAOS.jpg'
    },
    {
      id: '12',
      title: 'Down2Earth',
      artist: 'Ken Carson',
      album: 'More Chaos',
      duration: '2:56',
      url: 'https://archive.org/download/more-chaos-24bit-flac-tidal-rip/12%20Down2Earth.mp3',
      cover: 'https://ia601900.us.archive.org/22/items/more-chaos-24bit-flac-tidal-rip/MORECHAOS.jpg'
    },
    {
      id: '13',
      title: 'Confetti',
      artist: 'Ken Carson',
      album: 'More Chaos',
      duration: '4:32',
      url: 'https://archive.org/download/more-chaos-24bit-flac-tidal-rip/13%20Confetti.mp3',
      cover: 'https://ia601900.us.archive.org/22/items/more-chaos-24bit-flac-tidal-rip/MORECHAOS.jpg'
    },
    {
      id: '14',
      title: 'Naked',
      artist: 'Ken Carson',
      album: 'More Chaos',
      duration: '4:01',
      url: 'https://archive.org/download/more-chaos-24bit-flac-tidal-rip/14%20Naked.mp3',
      cover: 'https://ia601900.us.archive.org/22/items/more-chaos-24bit-flac-tidal-rip/MORECHAOS.jpg'
    },
    {
      id: '15',
      title: 'Kryptonite',
      artist: 'Ken Carson',
      album: 'More Chaos',
      duration: '4:05',
      url: 'https://archive.org/download/more-chaos-24bit-flac-tidal-rip/15%20Kryptonite.mp3',
      cover: 'https://ia601900.us.archive.org/22/items/more-chaos-24bit-flac-tidal-rip/MORECHAOS.jpg'
    },
    {
      id: '16',
      title: 'Psycho',
      artist: 'Ken Carson',
      album: 'More Chaos',
      duration: '3:13',
      url: 'https://archive.org/download/more-chaos-24bit-flac-tidal-rip/16%20Psycho.mp3',
      cover: 'https://ia601900.us.archive.org/22/items/more-chaos-24bit-flac-tidal-rip/MORECHAOS.jpg'
    },
    {
      id: '17',
      title: 'Inferno',
      artist: 'Ken Carson',
      album: 'More Chaos',
      duration: '3:23',
      url: 'https://archive.org/download/more-chaos-24bit-flac-tidal-rip/17%20Inferno.mp3',
      cover: 'https://ia601900.us.archive.org/22/items/more-chaos-24bit-flac-tidal-rip/MORECHAOS.jpg'
    },
    {
      id: '18',
      title: 'Thx',
      artist: 'Ken Carson',
      album: 'More Chaos',
      duration: '4:09',
      url: 'https://archive.org/download/more-chaos-24bit-flac-tidal-rip/18%20Thx.mp3',
      cover: 'https://ia601900.us.archive.org/22/items/more-chaos-24bit-flac-tidal-rip/MORECHAOS.jpg'
    },
    {
      id: '19',
      title: '2000',
      artist: 'Ken Carson',
      album: 'More Chaos',
      duration: '3:28',
      url: 'https://archive.org/download/more-chaos-24bit-flac-tidal-rip/19%202000.mp3',
      cover: 'https://ia601900.us.archive.org/22/items/more-chaos-24bit-flac-tidal-rip/MORECHAOS.jpg'
    },
    {
      id: '20',
      title: 'Evolution',
      artist: 'Ken Carson',
      album: 'More Chaos',
      duration: '4:46',
      url: 'https://archive.org/download/more-chaos-24bit-flac-tidal-rip/20%20Evolution.mp3',
      cover: 'https://ia601900.us.archive.org/22/items/more-chaos-24bit-flac-tidal-rip/MORECHAOS.jpg'
    },
    {
      id: '21',
      title: 'Ghoul',
      artist: 'Ken Carson',
      album: 'More Chaos',
      duration: '3:51',
      url: 'https://archive.org/download/more-chaos-24bit-flac-tidal-rip/21%20Ghoul.mp3',
      cover: 'https://ia601900.us.archive.org/22/items/more-chaos-24bit-flac-tidal-rip/MORECHAOS.jpg'
    },
    {
      id: '22',
      title: 'Off The Meter (feat. Destroy Lonely & Playboi Carti)',
      artist: 'Ken Carson',
      album: 'More Chaos',
      duration: '4:49',
      url: 'https://archive.org/download/more-chaos-24bit-flac-tidal-rip/22%20Off%20The%20Meter%20%28feat.%20Destroy%20Lonely%20%26%20Playboi%20Carti%29.mp3',
      cover: 'https://ia601900.us.archive.org/22/items/more-chaos-24bit-flac-tidal-rip/MORECHAOS.jpg'
    }
  ];

  const unityPlaylist: Track[] = [
    {
      id: '1',
      title: 'Why Not???',
      artist: 'Joost',
      album: 'Unity',
      duration: '2:49',
      url: 'https://public-service-live.ol.privateuser.xyz/%5BSPOTDOWNLOADER.COM%5D%20Why%20Not___.mp3',
      cover: 'https://e.snmc.io/i/600/s/d9735beaa64151e991082b17402a956e/13062960/joost-unity-Cover-Art.jpg'
    },
    {
      id: '2',
      title: 'Luchtballon',
      artist: 'Joost',
      album: 'Unity',
      duration: '3:33',
      url: 'https://public-service-live.ol.privateuser.xyz/%5BSPOTDOWNLOADER.COM%5D%20Luchtballon.mp3',
      cover: 'https://e.snmc.io/i/600/s/d9735beaa64151e991082b17402a956e/13062960/joost-unity-Cover-Art.jpg'
    },
    {
      id: '3',
      title: 'Gabberland',
      artist: 'Joost',
      album: 'Unity',
      duration: '2:56',
      url: 'https://public-service-live.ol.privateuser.xyz/%5BSPOTDOWNLOADER.COM%5D%20Gabberland.mp3',
      cover: 'https://e.snmc.io/i/600/s/d9735beaa64151e991082b17402a956e/13062960/joost-unity-Cover-Art.jpg'
    },
    {
      id: '4',
      title: '1',
      artist: 'Joost & Scooter',
      album: 'Unity',
      duration: '3:12',
      url: 'https://public-service-live.ol.privateuser.xyz/%5BSPOTDOWNLOADER.COM%5D%201.mp3',
      cover: 'https://e.snmc.io/i/600/s/d9735beaa64151e991082b17402a956e/13062960/joost-unity-Cover-Art.jpg'
    },
    {
      id: '5',
      title: 'United by Music',
      artist: 'Joost & Tommy Cash',
      album: 'Unity',
      duration: '3:07',
      url: 'https://public-service-live.ol.privateuser.xyz/%5BSPOTDOWNLOADER.COM%5D%20United%20By%20Music.mp3',
      cover: 'https://e.snmc.io/i/600/s/d9735beaa64151e991082b17402a956e/13062960/joost-unity-Cover-Art.jpg'
    },
    {
      id: '6',
      title: 'Discozwemmen',
      artist: 'Joost & Spinvis',
      album: 'Unity',
      duration: '3:28',
      url: 'https://public-service-live.ol.privateuser.xyz/%5BSPOTDOWNLOADER.COM%5D%20Discozwemmen.mp3',
      cover: 'https://e.snmc.io/i/600/s/d9735beaa64151e991082b17402a956e/13062960/joost-unity-Cover-Art.jpg'
    },
    {
      id: '7',
      title: 'Friesenjung',
      artist: 'Ski Aggu, Joost & Otto Waalkes',
      album: 'Unity',
      duration: '3:24',
      url: 'https://public-service-live.ol.privateuser.xyz/%5BSPOTDOWNLOADER.COM%5D%20Friesenjung.mp3',
      cover: 'https://e.snmc.io/i/600/s/d9735beaa64151e991082b17402a956e/13062960/joost-unity-Cover-Art.jpg'
    },
    {
      id: '8',
      title: 'Kunst und Musik',
      artist: 'Joost',
      album: 'Unity',
      duration: '3:41',
      url: 'https://public-service-live.ol.privateuser.xyz/%5BSPOTDOWNLOADER.COM%5D%20Kunst%20und%20Musik.mp3',
      cover: 'https://e.snmc.io/i/600/s/d9735beaa64151e991082b17402a956e/13062960/joost-unity-Cover-Art.jpg'
    },
    {
      id: '9',
      title: 'Filthy Dog',
      artist: 'Joost',
      album: 'Unity',
      duration: '2:38',
      url: 'https://public-service-live.ol.privateuser.xyz/%5BSPOTDOWNLOADER.COM%5D%20Filthy%20Dog.mp3',
      cover: 'https://e.snmc.io/i/600/s/d9735beaa64151e991082b17402a956e/13062960/joost-unity-Cover-Art.jpg'
    },
    {
      id: '10',
      title: 'We\'ll Meet Again',
      artist: 'Joost & Stuntje',
      album: 'Unity',
      duration: '4:02',
      url: 'https://public-service-live.ol.privateuser.xyz/%5BSPOTDOWNLOADER.COM%5D%20We\'ll%20Meet%20Again.mp3',
      cover: 'https://e.snmc.io/i/600/s/d9735beaa64151e991082b17402a956e/13062960/joost-unity-Cover-Art.jpg'
    },
    {
      id: '11',
      title: 'BOOM BOOM!!!!!',
      artist: 'Joost',
      album: 'Unity',
      duration: '2:45',
      url: 'https://public-service-live.ol.privateuser.xyz/%5BSPOTDOWNLOADER.COM%5D%20BOOM%20BOOM!!!!!.mp3',
      cover: 'https://e.snmc.io/i/600/s/d9735beaa64151e991082b17402a956e/13062960/joost-unity-Cover-Art.jpg'
    },
    {
      id: '12',
      title: 'Internetcafe 24/7',
      artist: 'Joost',
      album: 'Unity',
      duration: '3:15',
      url: 'https://public-service-live.ol.privateuser.xyz/%5BSPOTDOWNLOADER.COM%5D%20Internetcafe%2024_7.mp3',
      cover: 'https://e.snmc.io/i/600/s/d9735beaa64151e991082b17402a956e/13062960/joost-unity-Cover-Art.jpg'
    },
    {
      id: '13',
      title: 'Epiphany of Love: The Origin',
      artist: 'Joost, jungle bobby & Aldo2Swag',
      album: 'Unity',
      duration: '4:15',
      url: 'https://public-service-live.ol.privateuser.xyz/%5BSPOTDOWNLOADER.COM%5D%20Epiphany%20of%20Love_%20The%20Origin.mp3',
      cover: 'https://e.snmc.io/i/600/s/d9735beaa64151e991082b17402a956e/13062960/joost-unity-Cover-Art.jpg'
    },
    {
      id: '14',
      title: 'Europapa',
      artist: 'Joost',
      album: 'Unity',
      duration: '3:06',
      url: 'https://public-service-live.ol.privateuser.xyz/%5BSPOTDOWNLOADER.COM%5D%20Europapa.mp3',
      cover: 'https://e.snmc.io/i/600/s/d9735beaa64151e991082b17402a956e/13062960/joost-unity-Cover-Art.jpg'
    },
    {
      id: '15',
      title: 'Europapa - Outro',
      artist: 'Joost',
      album: 'Unity',
      duration: '1:52',
      url: 'https://public-service-live.ol.privateuser.xyz/%5BSPOTDOWNLOADER.COM%5D%20Europapa%20-%20Outro.mp3',
      cover: 'https://e.snmc.io/i/600/s/d9735beaa64151e991082b17402a956e/13062960/joost-unity-Cover-Art.jpg'
    },
    {
      id: '16',
      title: 'Last Man Standing',
      artist: 'Joost',
      album: 'Unity',
      duration: '3:18',
      url: 'https://public-service-live.ol.privateuser.xyz/%5BSPOTDOWNLOADER.COM%5D%20Last%20Man%20Standing.mp3',
      cover: 'https://e.snmc.io/i/600/s/d9735beaa64151e991082b17402a956e/13062960/joost-unity-Cover-Art.jpg'
    }
  ];

  const teenageDreamPlaylist: Track[] = [
    {
      id: '1',
      title: 'Teenage Dream',
      artist: 'Katy Perry',
      album: 'Teenage Dream',
      duration: '3:48',
      url: 'https://musify.club/track/dl/1083145/katy-perry-teenage-dream.mp3',
      cover: 'https://m.media-amazon.com/images/I/51jwXqA+w1L._UF1000,1000_QL80_.jpg'
    },
    {
      id: '2',
      title: 'Last Friday Night (T.G.I.F.)',
      artist: 'Katy Perry',
      album: 'Teenage Dream',
      duration: '3:50',
      url: 'https://musify.club/track/dl/1083146/katy-perry-last-friday-night-t-g-i-f.mp3',
      cover: 'https://m.media-amazon.com/images/I/51jwXqA+w1L._UF1000,1000_QL80_.jpg'
    },
    {
      id: '3',
      title: 'California Gurls (feat. Snoop Dogg)',
      artist: 'Katy Perry feat. Snoop Dogg',
      album: 'Teenage Dream',
      duration: '3:56',
      url: 'https://musify.club/track/dl/1083147/katy-perry-california-gurls-feat-snoop-dogg.mp3',
      cover: 'https://m.media-amazon.com/images/I/51jwXqA+w1L._UF1000,1000_QL80_.jpg'
    },
    {
      id: '4',
      title: 'Firework',
      artist: 'Katy Perry',
      album: 'Teenage Dream',
      duration: '3:48',
      url: 'https://archive.org/download/katy-perry-firework-/y2mate.com%20-%20Katy%20Perry%20-%20Firework%20%28Official%20Music%20Video%29_v144P.mp4',
      cover: 'https://m.media-amazon.com/images/I/51jwXqA+w1L._UF1000,1000_QL80_.jpg'
    },
    {
      id: '5',
      title: 'Peacock',
      artist: 'Katy Perry',
      album: 'Teenage Dream',
      duration: '3:52',
      url: 'https://musify.club/track/dl/1083149/katy-perry-peacock.mp3',
      cover: 'https://m.media-amazon.com/images/I/51jwXqA+w1L._UF1000,1000_QL80_.jpg'
    },
    {
      id: '6',
      title: 'Circle the Drain',
      artist: 'Katy Perry',
      album: 'Teenage Dream',
      duration: '4:32',
      url: 'https://musify.club/track/dl/1083150/katy-perry-circle-the-drain.mp3?token=tmj1czsaibc',
      cover: 'https://m.media-amazon.com/images/I/51jwXqA+w1L._UF1000,1000_QL80_.jpg'
    },
    {
      id: '7',
      title: 'The One That Got Away',
      artist: 'Katy Perry',
      album: 'Teenage Dream',
      duration: '3:47',
      url: 'https://jams.pics/download?data=TTZPYXl0NVdJTGlEVTQrK3hnakFEMFlnMWZ5QkZmQy9vZHNFb3FMSmhkcFhTVzZ6SDlWTTU0S2xPZTF0Yk5FeENZYjBIYkJ3STMrcDBzblFDRGR2MUp1UkpVa0gyTHl5amlRbEZCL3VmMGR3cm0waDE2cGFlREpOallraWw2MXlCWjJvY2hXcjk0T3hEWEVGcUlBTUhTQU80UkEyRDVSTU9iZFZHbUpmOVZMZ1VkaERzcXl4T1NMRjlSSm4xRFRTZEYwWmNyQmZiNFdpUWVacHVBZzV1VkwxMkl3Q3VBb2hpRDFQL3l1T001UG1WYnpSVFJERGNYS1l2WCt1MktuVXM1bTc4bG96YUsvM3FwbGFJd0ZFNEpiaXVBb1ZSZGxRRE5raUJtVzFUMjNUcGg5eGQ1VzVhOWFCYmQveUQ0bjhZMW90WHp1cnY5dVlIbXU5NzFnYnVVcjZxTCtYMkRLTm1PSE4zVFpud0NBZUdMQlVHNlRqYnN5TTZTcS8zenR0d2ZvUVYzazlscnJOVkh6WlJuckIxUFVnVXdUSGhwVk0rcWRFdDRxckE5ZXo5Y1c3RVAyelQ2SVBBSkE1Kzk1T3pRY0NkMTYxVEg0ZWo5Z1hvSkZnaHRyY3hwSk9waHFqYzVRQnFRTlUwREpLOW1UNG5DMHZ3MFE4c2hOYU56OC8',
      cover: 'https://m.media-amazon.com/images/I/51jwXqA+w1L._UF1000,1000_QL80_.jpg'
    },
    {
      id: '8',
      title: 'E.T. (feat. Kanye West)',
      artist: 'Katy Perry feat. Kanye West',
      album: 'Teenage Dream',
      duration: '3:51',
      url: 'https://www.soundboard.com/track/download/986913',
      cover: 'https://m.media-amazon.com/images/I/51jwXqA+w1L._UF1000,1000_QL80_.jpg'
    },
    {
      id: '9',
      title: 'Who Am I Living For?',
      artist: 'Katy Perry',
      album: 'Teenage Dream',
      duration: '4:08',
      url: 'https://musify.club/track/dl/1083153/katy-perry-who-am-i-living-for.mp3',
      cover: 'https://m.media-amazon.com/images/I/51jwXqA+w1L._UF1000,1000_QL80_.jpg'
    },
    {
      id: '10',
      title: 'Pearl',
      artist: 'Katy Perry',
      album: 'Teenage Dream',
      duration: '4:07',
      url: 'https://musify.club/track/dl/1083154/katy-perry-pearl.mp3',
      cover: 'https://m.media-amazon.com/images/I/51jwXqA+w1L._UF1000,1000_QL80_.jpg'
    },
    {
      id: '11',
      title: 'Hummingbird Heartbeat',
      artist: 'Katy Perry',
      album: 'Teenage Dream',
      duration: '3:32',
      url: 'https://musify.club/track/dl/1083155/katy-perry-hummingbird-heartbeat.mp3',
      cover: 'https://m.media-amazon.com/images/I/51jwXqA+w1L._UF1000,1000_QL80_.jpg'
    },
    {
      id: '12',
      title: 'Not Like the Movies',
      artist: 'Katy Perry',
      album: 'Teenage Dream',
      duration: '4:01',
      url: 'https://musify.club/track/dl/1083156/katy-perry-not-like-the-movies.mp3',
      cover: 'https://m.media-amazon.com/images/I/51jwXqA+w1L._UF1000,1000_QL80_.jpg'
    }
  ];

  const pinkTapePlaylist: Track[] = [
    {
      id: '1',
      title: 'Flooded The Face',
      artist: 'Lil Uzi Vert',
      album: 'Pink Tape',
      duration: '3:18',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/01-Flooded%20The%20Face.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    },
    {
      id: '2',
      title: 'Suicide Doors',
      artist: 'Lil Uzi Vert',
      album: 'Pink Tape',
      duration: '4:21',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/02-Suicide%20Doors.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    },
    {
      id: '3',
      title: 'Aye (Ft. Travis Scott)',
      artist: 'Lil Uzi Vert feat. Travis Scott',
      album: 'Pink Tape',
      duration: '3:31',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/03-Aye%20%28Ft.%20Travis%20Scott%29.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    },
    {
      id: '4',
      title: 'Crush Em',
      artist: 'Lil Uzi Vert',
      album: 'Pink Tape',
      duration: '2:51',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/04-Crush%20Em.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    },
    {
      id: '5',
      title: 'Amped',
      artist: 'Lil Uzi Vert',
      album: 'Pink Tape',
      duration: '2:58',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/05-Amped.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    },
    {
      id: '6',
      title: 'x2',
      artist: 'Lil Uzi Vert',
      album: 'Pink Tape',
      duration: '3:59',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/06-x2.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    },
    {
      id: '7',
      title: 'Died and Came Back',
      artist: 'Lil Uzi Vert',
      album: 'Pink Tape',
      duration: '3:06',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/07-Died%20and%20Came%20Back.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    },
    {
      id: '8',
      title: 'Spin Again',
      artist: 'Lil Uzi Vert',
      album: 'Pink Tape',
      duration: '1:48',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/08-Spin%20Again.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    },
    {
      id: '9',
      title: 'That Fiya',
      artist: 'Lil Uzi Vert',
      album: 'Pink Tape',
      duration: '2:41',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/09-That%20Fiya.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    },
    {
      id: '10',
      title: 'I Gotta',
      artist: 'Lil Uzi Vert',
      album: 'Pink Tape',
      duration: '2:58',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/10-I%20Gotta.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    },
    {
      id: '11',
      title: 'Endless Fashion (Ft. Nicki Minaj)',
      artist: 'Lil Uzi Vert feat. Nicki Minaj',
      album: 'Pink Tape',
      duration: '3:41',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/11-Endless%20Fashion%20%28Ft.%20Nicki%20Minaj%29.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    },
    {
      id: '12',
      title: 'Mama, I\'m Sorry',
      artist: 'Lil Uzi Vert',
      album: 'Pink Tape',
      duration: '3:36',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/12-Mama%2C%20I%E2%80%99m%20Sorry.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    },
    {
      id: '13',
      title: 'All Alone',
      artist: 'Lil Uzi Vert',
      album: 'Pink Tape',
      duration: '3:46',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/13-All%20Alone.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    },
    {
      id: '14',
      title: 'Nakamura',
      artist: 'Lil Uzi Vert',
      album: 'Pink Tape',
      duration: '3:23',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/14-Nakamura.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    },
    {
      id: '15',
      title: 'Just Wanna Rock',
      artist: 'Lil Uzi Vert',
      album: 'Pink Tape',
      duration: '2:11',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/15-Just%20Wanna%20Rock.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    },
    {
      id: '16',
      title: 'Fire Alarm',
      artist: 'Lil Uzi Vert',
      album: 'Pink Tape',
      duration: '3:11',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/16-Fire%20Alarm.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    },
    {
      id: '17',
      title: 'CS',
      artist: 'Lil Uzi Vert',
      album: 'Pink Tape',
      duration: '3:36',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/17-CS.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    },
    {
      id: '18',
      title: 'Werewolf (Ft. Bring Me The Horizon)',
      artist: 'Lil Uzi Vert feat. Bring Me The Horizon',
      album: 'Pink Tape',
      duration: '4:04',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/18-Werewolf%20%28Ft.%20Bring%20Me%20The%20Horizon%29.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    },
    {
      id: '19',
      title: 'Pluto to Mars',
      artist: 'Lil Uzi Vert',
      album: 'Pink Tape',
      duration: '4:09',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/19-Pluto%20to%20Mars.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    },
    {
      id: '20',
      title: 'Patience (Ft. Don Toliver)',
      artist: 'Lil Uzi Vert feat. Don Toliver',
      album: 'Pink Tape',
      duration: '4:24',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/20-Patience%20%28Ft.%20Don%20Toliver%29.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    },
    {
      id: '21',
      title: 'Days Come and Go',
      artist: 'Lil Uzi Vert',
      album: 'Pink Tape',
      duration: '4:21',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/21-Days%20Come%20and%20Go.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    },
    {
      id: '22',
      title: 'Rehab',
      artist: 'Lil Uzi Vert',
      album: 'Pink Tape',
      duration: '4:09',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/22-Rehab.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    },
    {
      id: '23',
      title: 'The End (Ft. BABYMETAL)',
      artist: 'Lil Uzi Vert feat. BABYMETAL',
      album: 'Pink Tape',
      duration: '3:13',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/23-The%20End%20%28Ft.%20BABYMETAL%29.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    },
    {
      id: '24',
      title: 'Zoom',
      artist: 'Lil Uzi Vert',
      album: 'Pink Tape',
      duration: '2:53',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/24-Zoom.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    },
    {
      id: '25',
      title: 'Of Course',
      artist: 'Lil Uzi Vert',
      album: 'Pink Tape',
      duration: '3:33',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/25-Of%20Course.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    },
    {
      id: '26',
      title: 'Shardai',
      artist: 'Lil Uzi Vert',
      album: 'Pink Tape',
      duration: '3:26',
      url: 'https://archive.org/download/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/26-Shardai.mp3',
      cover: 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
    }
  ];

  useEffect(() => {
    let tracks;
    if (theme === 'graduation') {
      tracks = graduationPlaylist;
    } else if (theme === 'deathrace') {
      tracks = deathracePlaylist;
    } else if (theme === 'question') {
      tracks = questionPlaylist;
    } else if (theme === 'gbgr') {
      tracks = gbgrPlaylist;
    } else if (theme === 'lnd') {
      tracks = lndPlaylist;
    } else if (theme === 'ye') {
      tracks = yePlaylist;
    } else if (theme === 'yeezus') {
      tracks = yeezusPlaylist;
    } else if (theme === 'morechaos') {
      tracks = moreChaosPlaylist;
    } else if (theme === 'unity') {
      tracks = unityPlaylist;
    } else if (theme === 'teenagedream') {
      tracks = teenageDreamPlaylist;
    } else if (theme === 'pinktape') {
      tracks = pinkTapePlaylist;
    } else {
      tracks = seventeenPlaylist;
    }

    setPlaylist(tracks);
    if (tracks.length > 0) {
      setCurrentTrack(tracks[0]);
      setTimeout(async () => {
        const audio = audioRef.current;
        if (audio) {
          try {
            await audio.play();
            setIsPlaying(true);
          } catch (error) {
            console.log('Auto-play blocked by browser, user interaction required');
          }
        }
      }, 500);
    }
  }, [theme]);

  useEffect(() => {
    if (savedPlaybackState.wasPlaying && currentTrack && savedPlaybackState.time > 0) {
      const audio = audioRef.current;
      if (audio) {
        const restorePlayback = async () => {
          try {
            audio.currentTime = savedPlaybackState.time;
            if (savedPlaybackState.wasPlaying) {
              await audio.play();
              setIsPlaying(true);
            }
            setSavedPlaybackState({ time: 0, wasPlaying: false }); 
          } catch (error) {
            console.error('Failed to restore playback:', error);
          }
        };
        setTimeout(restorePlayback, 100);
      }
    }
  }, [useEmbedPlayer, currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const saveProgress = () => {
      if (isPlaying && audio.currentTime > 0) {
        setSavedPlaybackState(prev => ({
          ...prev,
          time: audio.currentTime
        }));
      }
    };

    const interval = setInterval(saveProgress, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handleError = () => {
      setAudioError('Failed to load audio. Please retry later.');
      setIsLoading(false);
      setIsPlaying(false);
    };
    const handleLoadStart = () => {
      setIsLoading(true);
      setAudioError(null);
    };
    const handleCanPlay = () => {
      setIsLoading(false);
      setAudioError(null);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleNext);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleNext);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentTrack]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        setAudioError(null);
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback failed:', error);
      setAudioError('Failed to play track. Check your internet connection.');
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    const currentIndex = playlist.findIndex(track => track.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    const wasPlaying = isPlaying;

    setCurrentTrack(playlist[nextIndex]);

    if (wasPlaying) {
      setTimeout(async () => {
        const audio = audioRef.current;
        if (audio) {
          try {
            await audio.play();
            setIsPlaying(true);
          } catch (error) {
            console.error('Auto-play failed:', error);
          }
        }
      }, 100);
    }
  };

  const handlePrevious = async () => {
    const currentIndex = playlist.findIndex(track => track.id === currentTrack?.id);
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    const wasPlaying = isPlaying;

    setCurrentTrack(playlist[prevIndex]);
    if (wasPlaying) {
      setTimeout(async () => {
        const audio = audioRef.current;
        if (audio) {
          try {
            await audio.play();
            setIsPlaying(true);
          } catch (error) {
            console.error('Auto-play failed:', error);
          }
        }
      }, 100);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  const themeColors = theme === 'graduation'
    ? { primary: '#3B82F6', secondary: '#EC4899', accent: '#F59E0B' }
    : theme === 'question'
    ? { primary: '#404040', secondary: '#2D2D2D', accent: '#1A1A1A' }
    : theme === 'gbgr'
    ? { primary: '#2563EB', secondary: '#F59E0B', accent: '#10B981' }
    : theme === 'lnd'
    ? { primary: '#8B5CF6', secondary: '#EC4899', accent: '#F59E0B' }
    : theme === 'ye'
    ? { primary: '#22C55E', secondary: '#16A34A', accent: '#15803D' }
    : theme === 'yeezus'
    ? { primary: '#DC2626', secondary: '#B91C1C', accent: '#991B1B' }
    : theme === 'morechaos'
    ? { primary: '#8B5CF6', secondary: '#EC4899', accent: '#1F1F1F' }
    : theme === 'unity'
    ? { primary: '#F59E0B', secondary: '#D97706', accent: '#B45309' }
    : theme === 'teenagedream'
    ? { primary: '#FF69B4', secondary: '#FF1493', accent: '#DA70D6' }
    : theme === 'pinktape'
    ? { primary: '#FF1493', secondary: '#FF69B4', accent: '#C71585' }
    : { primary: '#3A3A3A', secondary: '#5A5A5A', accent: '#7A7A7A' };



  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        onEnded={handleNext}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onError={() => setAudioError('Failed to load track')}
        style={{ display: 'none' }}
      />
      {!isExpanded && (
        <div
          className="fixed bottom-6 right-16 w-24 h-24 cursor-pointer transition-all duration-300 hover:scale-110 z-50 group"
          onClick={() => setIsExpanded(true)}
        >
          <div className="relative w-full h-full">
            <div
              className={`absolute inset-0 rounded-full shadow-2xl overflow-hidden ${isPlaying ? 'animate-spin' : ''}`}
              style={{
                animationDuration: '3s',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                backgroundImage: currentTrack?.cover ? `url(${currentTrack.cover})` : 'linear-gradient(135deg, #374151, #1f2937)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 rounded-full">
                <div className="absolute inset-2 rounded-full border border-black/20"></div>
                <div className="absolute inset-4 rounded-full border border-black/15"></div>
                <div className="absolute inset-6 rounded-full border border-black/10"></div>
                <div className="absolute inset-8 rounded-full border border-black/10"></div>
              </div>
              <div className="absolute inset-0 rounded-full bg-black/20"></div>
              <div className="absolute inset-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black border border-gray-600 shadow-inner"></div>
            </div>
          </div>
          {isPlaying && (
            <div
              className="absolute inset-0 rounded-full animate-pulse"
              style={{
                background: `radial-gradient(circle, ${themeColors.primary}40 0%, transparent 70%)`,
                filter: 'blur(8px)'
              }}
            ></div>
          )}

          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap max-w-48 backdrop-blur-sm">
            {currentTrack
              ? `♪ ${currentTrack.title} - ${currentTrack.artist}`
              : `${theme === 'graduation' ? 'Graduation' : theme === 'deathrace' ? 'Death Race for Love' : theme === 'question' ? '?' : theme === 'gbgr' ? 'Goodbye & Good Riddance' : theme === 'lnd' ? 'Legends Never Die' : theme === 'ye' ? 'ye' : theme === 'yeezus' ? 'Yeezus' : theme === 'morechaos' ? 'More Chaos' : theme === 'unity' ? 'Unity' : theme === 'teenagedream' ? 'Teenage Dream' : theme === 'pinktape' ? 'Pink Tape' : '17'} Album Player`
            }
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
          </div>
        </div>
      )}

      {isExpanded && (
        <div
          className="fixed bottom-6 right-6 w-[600px] h-28 backdrop-blur-xl border border-white/10 rounded-2xl p-5 z-50 transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(255,255,255,0.1))`,
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-14 h-14 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                <img
                  src={currentTrack?.cover
                    ? currentTrack.cover
                    : theme === 'graduation'
                    ? 'https://upload.wikimedia.org/wikipedia/en/7/70/Graduation_%28album%29.jpg'
                    : theme === 'deathrace'
                    ? 'https://ia600307.us.archive.org/20/items/juice-wrld-death-race-for-love-bonus-track-verison/Death%20Race%20for%20Love%20%28Bonus%20Track%20Version%29%20%5B2022%5D/Death%20Race%20For%20Love%20%28Album%20Cover%29.jpg'
                    : theme === 'ye'
                    ? 'https://wallpaperaccess.com/full/4198173.jpg'
                    : theme === 'yeezus'
                    ? 'https://image-cdn.hypb.st/https://hypebeast.com/wp-content/blogs.dir/4/files/2013/06/kanye-west-yeezus-official-album-artwork-0.jpg'
                    : theme === 'question'
                    ? 'https://ia801501.us.archive.org/0/items/14-xxxtentacion-feat.-rio-santana-judah-carlos-andrez-i-dont-even-speak-spanish-lol/huh.jpeg'
                    : theme === 'gbgr'
                    ? 'https://e1.pxfuel.com/desktop-wallpaper/406/974/desktop-wallpaper-gbgr-juice-wrld-goodbye-good-riddance.jpg'
                    : theme === 'lnd'
                    ? 'https://wallpaperaccess.com/full/6302625.png'
                    : theme === 'morechaos'
                    ? 'https://ia601900.us.archive.org/22/items/more-chaos-24bit-flac-tidal-rip/MORECHAOS.jpg'
                    : theme === 'unity'
                    ? 'https://e.snmc.io/i/600/s/d9735beaa64151e991082b17402a956e/13062960/joost-unity-Cover-Art.jpg'
                    : theme === 'teenagedream'
                    ? 'https://m.media-amazon.com/images/I/51jwXqA+w1L._UF1000,1000_QL80_.jpg'
                    : theme === 'pinktape'
                    ? 'https://ia904607.us.archive.org/15/items/lil-uzi-vert-pink-tape-2023-album/Pink%20Tape/a.jpg'
                    : 'https://i.ytimg.com/vi/ng0GKh-v0DQ/maxresdefault.jpg'
                  }
                  alt="Album Cover"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-base font-semibold truncate mb-1">
                  {currentTrack ? currentTrack.title : 'No track playing'}
                </div>
                <div className="text-white/70 text-sm truncate">
                  {currentTrack
                    ? currentTrack.artist
                    : `${theme === 'graduation' ? 'Kanye West' : theme === 'deathrace' || theme === 'gbgr' || theme === 'lnd' ? 'Juice WRLD' : 'XXXTentacion'}`
                  }
                </div>
              </div>
              <div className="flex items-center space-x-2 mr-4">
                <button
                  onClick={handlePrevious}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                  </svg>
                </button>

                <button
                  onClick={togglePlay}
                  disabled={isLoading}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 hover:scale-105 shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : isPlaying ? (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>

                <button
                  onClick={handleNext}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                  </svg>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
                <div className="w-20 h-1.5 bg-white/10 rounded-full relative">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${volume * 100}%`,
                      background: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.secondary})`
                    }}
                  ></div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <span className="text-xs text-white/60 w-8 text-right">{Math.round(volume * 100)}%</span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex items-center">
              <div className="flex-1">
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${(currentTime / duration) * 100}%`,
                      background: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.secondary})`
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-white/60 mt-0.5">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MusicPlayer;


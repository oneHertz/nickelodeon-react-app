import react from 'react'
import MediaSession from "./components/mediaSessionWrapper";
import Controls from './components/controls'
import ProgressBar from './components/progressBar'
import LogoutBtn from './components/logoutBtn'
import LoginForm from './components/loginForm'
import SearchView from './components/searchView'
import QueueView from './components/queueView'
import UploadForm from './components/uploadForm'
import { useSnackbar } from 'notistack';
import { Helmet } from 'react-helmet';

import swal from "sweetalert";

import './App.css'
import React from 'react';

const appHeight = () => {
  const doc = document.documentElement;
  doc.style.setProperty("--app-height", `${window.visualViewport.height}px`);
  const searchResultDiv = document.getElementById('searchResults');
  doc.style.setProperty("--app-header-height", searchResultDiv ? `${searchResultDiv.offsetTop}px` : '0px');
};

window.addEventListener("resize", appHeight);

import pkg from '../package.json';
import { printVinyl } from './vinyl';

const options = {
  //audio lists model
  apiRoot: localStorage.devserver || pkg.api_homepage,
  authToken: localStorage.getItem('auth_token'),
  username: localStorage.getItem('username'),
  isSuperuser: localStorage.getItem('is_superuser'),
};

const SEARCH = 'search'
const QUEUE = 'queue'
const PLAYER = 'player'
const UPLOAD = 'upload'

function App() {
  const [audioData, setAudioData] = react.useState(null)
  const [artwork, setArtwork] = react.useState("")
  const [audioPlayer, setAudioPlayer] = react.useState(null)
  const [view, setView] = react.useState(PLAYER)
  const [currentTime, setCurrentTime] = react.useState(0)
  const [duration, setDuration] = react.useState(0)
  const [queue, setQueue] = react.useState([])
  const [randomQueue, setRandomQueue] = react.useState([])
  const [firstLoadDone, setFirstLoadDone] = react.useState(false)
  const [isPaused, setIsPaused] = react.useState(true)
  const [username, setUsername] = react.useState(options.username)
  const [isSuperuser, setIsSuperuser] = react.useState(options.isSuperuser)

  const audioEl = react.useCallback((node) => {
    setAudioPlayer(node);
  }, []);
  
  react.useEffect(() => {
    setIsPaused(audioPlayer?.paused)
  }, [audioPlayer?.paused])

  const { enqueueSnackbar } = useSnackbar();

  react.useEffect(() => {
    appHeight()
    const t = localStorage.getItem('current_v2');
    const q = localStorage.getItem('queue_v2');
    try {
      if (q) {
        setQueue(JSON.parse(q));
      }
    } catch {}
    try {
      if (t) {
        setAudioData(JSON.parse(t));
      }
    } catch {}
    (async() => {
      try {
        const resp = await fetch(`${options.apiRoot}/`, {
          method: 'GET',
          credentials: 'omit',
          headers: {
            Authorization: 'Token ' + options.authToken,
            'Content-Type': 'application/json'
          }
        }).catch(() => {});
        if (resp?.status === 401) {
          throw new Error('Unauthorized')
        }
        const data = await resp.json()
        if (data?.status !== "logged in") {
          throw Error('User not logged in');
        }
        setUsername(data.username);
        setIsSuperuser(data.is_superuser);
      } catch(e) {
        await onLoggedOut()
      }
    })()
  }, []);

  react.useEffect(() => {
    appHeight()
  }, [view, window.visualViewport.height]);

  react.useEffect(() => {
    if(!options.authToken) {
      setUsername(null);
      return
    } else if (localStorage.getItem('current_v2')) {
      try {
        setAudioData(JSON.parse(localStorage.getItem('current_v2')));
        return
      } catch {}
    }
    (async () => await fetchRandomSongs())();
    return;
  }, [options.apiRoot, options.authToken])

  react.useEffect(() => {
    localStorage.setItem('queue_v2', JSON.stringify(queue));
  }, [queue])

  react.useEffect(() => {
    localStorage.setItem('username', username);
    if (!username) {
      localStorage.removeItem('username', username);
      localStorage.removeItem('auth_token');
    }
  }, [username])

  react.useEffect(() => {
    const onLoaded = () => {
      if (firstLoadDone) {
        audioPlayer.play();
      }
    };

    if(audioPlayer && audioData) {
      audioPlayer.addEventListener("loadeddata", onLoaded);
      audioPlayer.load();
      (async () => setArtwork(await printVinyl(audioData?.filename)))();
      localStorage.setItem('current_v2', JSON.stringify(audioData));
      if (!firstLoadDone) {
        setFirstLoadDone(true);
      }
    }
    return () => {
      audioPlayer?.removeEventListener?.("loadeddata", onLoaded);
    } 
  }, [audioPlayer, audioData, firstLoadDone])

  const fetchRandomSongs = async (forcePlay=false) => {
    try {
      const resp = await fetch(`${options.apiRoot}/songs/random_list/`, {
        method: 'GET',
        credentials: 'omit',
        headers: {
          Authorization: 'Token ' + options.authToken,
          'Content-Type': 'application/json'
        }
      }).catch(() => {});
      if (resp.status === 401) {
        throw new Error('Unauthorized')
      }
      const data = await resp.json()
      
      if (!audioData || forcePlay) {
        const q = [...data];
        const track = q.shift();
        setRandomQueue([...q]);
        setAudioData(track);
      } else {
        setRandomQueue(data);
      }
    } catch(e) {
      await onLoggedOut();
    }
  }

  const onAudioEnd = () => {
    if(queue.length) {
      const q = [...queue];
      const track = q.shift();
      setQueue([...q])
      setAudioData(track);
    } else if (randomQueue.length) {
      const q = [...randomQueue];
      const track = q.shift();
      setRandomQueue([...q])
      setAudioData(track);
      (async () => fetchRandomSongs())();
    } else {
      (async () => fetchRandomSongs(true))();
    }
  }

  const onAudioPlaying = () => {
    setCurrentTime(audioPlayer.currentTime)
    setDuration(audioPlayer.duration)
  } 

  const onPlay = async (e) => {
    if (e?.preventDefault) {
      e?.preventDefault();
    }
    await audioPlayer.play()
  }

  const onPause = async (e) => {
    if (e?.preventDefault) {
      e?.preventDefault();
    }
    await audioPlayer.pause()
  }

  const onNext = (e) => {
    if (e?.preventDefault) {
      e?.preventDefault();
    }
    onAudioEnd();
  }

  const onQueue = (track) => {
    setQueue([...queue, track]);
  }

  const onUnQueue = (idx) => {
    const newQueue = [...queue];
    newQueue.splice(idx, 1);
    setQueue(newQueue);
  }

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onShuffleQueue = () => {
    let q = [...queue];
    for (let i = q.length-1; i > 0; i--) {
      q = reorder(
        q,
        Math.floor(Math.random() * (i+1)),
        i
      );
    }
    setQueue(q);
  }

  const onDragQueueEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    const q = reorder(
      queue,
      result.source.index,
      result.destination.index
    );
    setQueue(q);
  }

  const deleteAudio = async (song, cb) => {
    const { apiRoot, authToken } = options;
    const hasConfirmed = await swal('Are you sure you want to delete this file "'+song.filename.split('/').pop()+'"?');
    if (hasConfirmed) {
      await fetch(apiRoot + '/songs/' + song.id,
      {
        method: 'DELETE',
        headers: {
          Authorization: 'Token ' + authToken,
          Accept: "application/json",
          'Content-Type': 'application/json'
        }
      }).then(async (response) => {
        if (response.status === 204) {
          console.log('Song ' + song.id + ' Deleted');
          const q = queue.filter(s => s.id !== song.id);
          setQueue(q);
          const currentId = audioData?.id;
          if (currentId === song.id) {
            onAudioEnd();
          }
          cb && cb();
        } else if (response.status === 401) {
          await onLoggedOut()
        } else {
          swal('Something went wrong...', '', 'error');
        }
      }).catch(()=>{
        swal('Something went wrong...', '', 'error');
      });
    }
  };

  const editAudioFilename = async (song, cb) => {
    var newPath = await swal('New file path', {
      content: {
        element: 'input',
        attributes: {
          defaultValue: song.filename,
        }
      }
    });
    if (newPath && newPath !== song.filename) {
        const { apiRoot, authToken } = options;
        await fetch(apiRoot + '/songs/' + song.id,
        {
          method: 'PATCH',
          headers: {
            Authorization: 'Token ' + authToken,
            Accept: "application/json",
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({filename: newPath}),
        }).then(async (response) => {
          if (response.status === 200) {
            const q = queue.map(s => {if(s.id === song.id){s.filename = newPath;}return s});
            setQueue(q);
            const currentId = audioData?.id;
            if (currentId === song.id) {
              setAudioData({...audioData, filename: newPath})
            }
            cb && cb(newPath);
          } else if (response.status === 401) {
            await onLoggedOut()
          } else {
            swal('Something went wrong...', '', 'error');
          }
        }).catch(e => {
          swal('Something went wrong...', '', 'error');
        });
    }
  };

  const onLoggedIn = async ({ username: _username, token, isSuperuser: _isSuperuser}) => {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('username', _username)
    localStorage.setItem('is_superuser', _isSuperuser) 
    options.authToken = token
    setUsername(_username)
    setIsSuperuser(_isSuperuser)
  }

  const onLoggedOut = async () => {
    setUsername(null);
    setIsSuperuser(null);
    setAudioData(null);
    setFirstLoadDone(false);
    setQueue([]);
  }

  const onSelectAudio = (data) => {
    setAudioData(data);
  }

  const getAudioUrl = (data) => {
    if(data) {
      return data.download_url + '.mp3?auth_token=' + options.authToken
    }
    return null
  }
  
  const onAudioDownload = (e) => {
      e.preventDefault();
      const url = getAudioUrl(audioData)
      const name = audioData.filename?.split('/')?.pop() + '.mp3'
      if (name && url) {
        const link = document.createElement('a')
        link.setAttribute("download", name)
        link.setAttribute("name", name)
        link.setAttribute("href", url)
        link.click()
      }
  };

  return (
    <><Helmet defer={false}>
        <title>{audioData?.filename ? audioData?.filename?.split('/')?.pop() + " | ":  ""} Humppakone</title>
      </Helmet>
      {username && (<>
        <ProgressBar audioPlayer={audioPlayer} currentTime={currentTime} duration={duration}></ProgressBar>

        <LogoutBtn apiRoot={options.apiRoot} authToken={options.authToken} onLoggedOut={onLoggedOut}/>
        <Controls
          isPaused={isPaused}
          onPlay={onPlay}
          onPause={onPause}
          onNext={onNext}
          onDownload={onAudioDownload}
          onSearch={() => setView(SEARCH)}
          onShowQueue={() => setView(QUEUE)}
          onUpload={() => setView(UPLOAD)
        }></Controls>
        { (view === PLAYER || true) && (
        <div style={{margin: "0 15px"}}>
          <i className="fa-brands fa-itunes-note"></i> <span className="audioTitle">{audioData?.filename?.split('/')?.pop()}</span><br />
          <span className="audioFullTitle"><small>{audioData?.filename}</small></span>
        </div>)}
        { view === SEARCH && (
          <SearchView apiRoot={options.apiRoot} onSelect={onSelectAudio} onLoggedOut={onLoggedOut} onCloseSearch={()=>setView(PLAYER)} currentUsername={username} authToken={options.authToken} isSuperuser={isSuperuser} onQueue={onQueue} queue={queue} deleteAudio={deleteAudio} editAudioFilename={editAudioFilename}></SearchView>
        )}
        { view === QUEUE && (
          <QueueView apiRoot={options.apiRoot} onSelect={onSelectAudio} onCloseQueue={()=>setView(PLAYER)} currentUsername={username} authToken={options.authToken} isSuperuser={isSuperuser} onShuffleQueue={onShuffleQueue} onUnQueue={onUnQueue} queue={queue} onDragQueueEnd={onDragQueueEnd} deleteAudio={deleteAudio} editAudioFilename={editAudioFilename}></QueueView>
        )}
        { view === UPLOAD && (
          <UploadForm apiRoot={options.apiRoot} authToken={options.authToken} enqueueSnackbar={enqueueSnackbar} onClose={()=>setView(PLAYER)}></UploadForm>
        )}
        <MediaSession
          title={audioData?.filename?.split('/')?.pop()}
          album={audioData?.filename?.split('/')?.slice(0, -1).join("/")}
          artist="Humppakone.com"
          onPlay={onPlay}
          onPause={onPause}
          onNextTrack={onNext}
          artwork={[
            {
              src: artwork,
              size: "512x512"
            },
          ]}
        />
        <audio ref={audioEl} onEnded={onAudioEnd} onTimeUpdate={onAudioPlaying} preload="auto" tabIndex="0">
          <source src={getAudioUrl(audioData)}></source>
        </audio>
      </>)}
      {!username && <>
        <LoginForm apiRoot={options.apiRoot} onLoggedIn={onLoggedIn}></LoginForm>
      </>}
    </>
  );
}

export default App;

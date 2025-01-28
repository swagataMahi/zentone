const playbtn = document.querySelector("#playSong");
const songUL = document.querySelector(".songlistUL");
const songUL_LI = songUL.getElementsByTagName("li");
const songbtn = songUL.getElementsByClassName("play-now");
const songinfo = document.querySelector(".song-info").getElementsByTagName("p")[0];
const songtime = document.querySelector(".songtime").getElementsByTagName("p")[0];
const seekBar = document.querySelector(".seekbar");
const prevSong = document.querySelector("#prev-song");
const nextSong = document.querySelector("#next-song");
const voulmeBtn = document.querySelector('.black-range');

const cardContainer = document.querySelector('.card-container');
let currentsong = new Audio();
let songs;
let songList = [];
let currFolder;


//function to convert seconds format to minute

function formatTime(seconds) {
  seconds = Math.floor(seconds);
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = seconds % 60;
  let formattedSeconds =
    remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

  return `${minutes}:${formattedSeconds}`;
}

//Function to load the page 

let load =  async() => {
  let songlocal = localStorage.getItem("song");
  let folderlocal = localStorage.getItem('folder');
  currFolder = folderlocal ? folderlocal : '';
  let song = songlocal ? songlocal : "";
  songinfo.innerText = song;
  currentsong.src = `/${currFolder}/${song}`;

  
  songs = await getSongs(`${currFolder}`);
  songList = [];
        for(let i = 0 ; i < songs.length; i++){
            songList[i] = songs[i].split(`/${folderlocal}/`)[1];
        }
        for(let i = 0; i<songList.length;i++){
            songList[i] = songList[i].split('.')[0];
        }

    songList = songList.map(song => decodeURIComponent(song));
    populateList(songList);

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });
  main();
};

//*****************function to populate the list */

let populateList = (songList) => {
    songUL.innerHTML = ''; // Clear existing content before populating
  
    songList.forEach((item) => {
      let li = document.createElement('li');
      li.classList.add('songs');
  
      let img = document.createElement('img');
      img.classList.add('invert');
      img.src = 'assets/music.svg';
      img.alt = '';
  
      let infoDiv = document.createElement('div');
      infoDiv.classList.add('info');
  
      let songNameDiv = document.createElement('div');
      songNameDiv.classList.add('songName');
      songNameDiv.textContent = item;
  
      let playNowDiv = document.createElement('div');
      playNowDiv.classList.add('play-now');
  
      let playImg = document.createElement('img');
      playImg.classList.add('invert');
      playImg.src = 'assets/play.svg';
      playImg.alt = '';

  
      playNowDiv.appendChild(playImg);
      infoDiv.appendChild(songNameDiv);
      li.appendChild(img);
      li.appendChild(infoDiv);
      li.appendChild(playNowDiv);
  
      songUL.appendChild(li);
    }); 
  }
  
/********************fetch songs from folder */

const getSongs = async (folder) => {
    currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${currFolder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  let songs = [];

  for (let i = 0; i < as.length; i++) {
    const element = as[i];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href);
      songList.push(element.href.split(`/${currFolder}/`)[1]);
    }
  }
  return songs;
}


//function to play song

function playSong(song) {
  currentsong.src = `/${currFolder}/${song}`;
  currentsong.play();
  playbtn.src = "/assets/pause.svg";
  songinfo.innerText = song;
}

/******************************************Function to display albums */
async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();
  let div = document.createElement('div');
  div.innerHTML = response;
  let anchors = div.getElementsByTagName('a');
  let folderList = [];
  for (let i = 0; i < anchors.length; i++) {
    const element = anchors[i];
    if (element.href.includes("/songs/")) {
      folderList[i] = element.querySelector('.name').innerText;
    }
  }

  folderList = folderList.filter(item => item !== '');
  for (let i = 0; i < folderList.length; i++) {
    let item = folderList[i];
    let c = await fetch(`http://127.0.0.1:5500/songs/${item}/info.json`);
    let mdata = await c.json();
    let imageExtension = mdata.imageExtension || 'jpeg';
    cardContainer.innerHTML += `
        <div class="card">
            <div style="padding: 0;">
                <div class="play" data-folder="${item}"
                    style="width: 41px; height: 41px; border-radius: 50%; background-color: #1fdf64; display: flex; justify-content: center; align-items: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                        color="#000000" fill="#000">
                        <path
                            d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                            stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                    </svg>
                </div>
            </div>

            <img src="songs/${item}/cover.${imageExtension}" alt="">
            <h3>${mdata.title}</h3>
            <p>${mdata.description}</p>
        </div>
    `;
  }

  const cards = document.querySelectorAll('.card');
  const plays = document.querySelectorAll('.play');

  for (let i =0 ; i< cards.length;i++){
    cards[i].addEventListener('mouseenter', () => {
    plays[i].classList.add('visible');    
  });

  cards[i].addEventListener('mouseleave', () => {
    plays[i].classList.remove('visible');
  })
}

Array.from(plays).forEach(item => {
  item.addEventListener('click',async e => {
      let foldername = e.currentTarget.dataset.folder;
      localStorage.setItem('folder-name',foldername);
      songs = await getSongs(`songs/${foldername}`);
      
      songList = [];
      for(let i = 0 ; i < songs.length; i++){
          songList[i] = songs[i].split(`/${foldername}/`)[1];
      }
      for(let i = 0; i<songList.length;i++){
          songList[i] = songList[i].split('.')[0];
      }

     songList = songList.map(song => decodeURIComponent(song));

      populateList(songList);
  })
}) 
}


//main function 

async function main() {
  songs = await getSongs(`${currFolder}`);

// Attach the click event listener to the parent element songListContainer
songUL.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('songs')) {
        // Handle the click event on the songs
        let songDiv = e.target.querySelector('.songName');
        let song = songDiv.innerText;
        song += '.mp3'; // Assuming the song name needs to have .mp3 extension
        try {
            localStorage.setItem("song", song);
            localStorage.setItem('folder', `${currFolder}`);
            console.log("Song stored in local storage");
          } catch (error) {
            console.error("Error storing song in local storage:", error);
          }
        playSong(song);
    }
});


songUL.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('play-now')) {
        // Handle the click event on the play button within the song item
        let songDiv = e.target.parentNode.querySelector('.songName');
        let song = songDiv.innerText;
        song += '.mp3'; // Assuming the song name needs to have .mp3 extension
        try {
            localStorage.setItem("song", song);
            localStorage.setItem('folder', `${currFolder}`);
            console.log("Song stored in local storage");
          } catch (error) {
            console.error("Error storing song in local storage:", error);
          }
        playSong(song);
    }
});



  //PlayBar buttons functionality*******************************************

  playbtn.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      playbtn.src = "/assets/pause.svg";
    } else {
      currentsong.pause();
      playbtn.src = "/assets/play.svg";
    }
  });

  currentsong.addEventListener("timeupdate", () => {
    songtime.innerText = `${formatTime(currentsong.currentTime)}/${formatTime(
      currentsong.duration
    )}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  seekBar.addEventListener("click", (e) => {
    document.querySelector(".circle").style.left =
      (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
    currentsong.currentTime =
      currentsong.duration *
      (e.offsetX / e.target.getBoundingClientRect().width);
  });

  //Previous & Next BUTTONS **************************************************

  prevSong.addEventListener("click", () => {
    let newListWithmp3 = songList.map((item) => item + ".mp3");
    let songsrc = currentsong.src.split(`/${currFolder}/`)[1];
    for (let i = 0; i < newListWithmp3.length; i++) {
      if (songsrc === newListWithmp3[i]) {
        if (i > 0) {
          playSong(newListWithmp3[i - 1]); // Play the previous song
          break; // Exit the loop after playing the previous song
        } else {
          playSong(newListWithmp3[newListWithmp3.length - 1]); // Play the last song in the list
          break;
        }
      }
    }
  });

  nextSong.addEventListener("click", () => {
    let newListWithmp3 = songList.map((item) => item + ".mp3");
    let songsrc = currentsong.src.split(`/${currFolder}/`)[1];
    for (let i = 0; i < newListWithmp3.length; i++) {
      if (songsrc === newListWithmp3[i]) {
        if (i < newListWithmp3.length - 1) {
          playSong(newListWithmp3[i + 1]);
          break; // Exit the loop after playing the next song
        } else {
          playSong(newListWithmp3[0]);
          break;
        }
      }
    }
  });

  voulmeBtn.addEventListener('change',e=> {
    currentsong.volume = parseInt(e.target.value)/100;
  })

  const volImg = document.querySelector('.vol-img'); 
  const rangeContainer = document.querySelector('.range');

// Add click event listener to the volume image
volImg.addEventListener('click', () => {
    // Toggle the visibility of the range container
    rangeContainer.style.display = rangeContainer.style.display === 'none' ? 'block' : 'none';
});

displayAlbums();
}

load();





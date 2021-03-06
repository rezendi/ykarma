const util = require('./util');

function getGIFFor(amount) {
  util.log("getting GIF for", amount);
  var options = [];
  switch(amount) {
    case 1:
      options = [
        "https://giphy.com/gifs/statefarm-ad-2Wf4evHz9Yd7Y8mPNR",
        "https://giphy.com/gifs/studiosoriginals-numbers-gilphabet-l0ExncehJzexFpRHq",
        "https://giphy.com/gifs/happy-trippy-typography-g0BicKQx8cH3MW8rCt"
      ];
      break;
    case 2:
      options = [
        "https://giphy.com/gifs/thebachelor-episode-7-abc-xTiN0h0Kh5gH7yQYUw",
        "https://giphy.com/gifs/mostexpensivest-viceland-2-fBGlnzGjFL3dSdvTBo"
      ];
      break;
    case 3:
      options = [
        "https://giphy.com/gifs/nhlcanes-carolina-hurricanes-26AHIbtfGWCi2Q2C4",
        "https://giphy.com/gifs/26h0pQdlddhWYJfgc"
      ];
      break;
    case 4:
      options = [
        "https://giphy.com/gifs/paulmccartney-one-math-3o6YgjB8zBvvERC6v6",
        "https://giphy.com/gifs/80s-connect-four-GqDnImZ3UdJhS"
      ];
      break;
    case 5:
      options = [
        "https://giphy.com/gifs/end-kobe-probasketballtalk-nYHRWagU8EDtu",
        "https://giphy.com/gifs/fail-awkward-fox-sports-uIeAJ5LVIQ5ji"
      ];
      break;
    case 6:
      options = [
        "https://giphy.com/gifs/usfigureskating-countdown-6-3ov9k9zNbWnIUCdzRC",
        "https://giphy.com/gifs/ytwfxx-gretchen-fxx-3o7aCYNWwi1vOC4nTi",
        "https://giphy.com/gifs/ytwfxx-jimmy-fxx-xT9IgNeypa6nenbkzu"
      ];
      break;
    case 7:
      options = [
        "https://giphy.com/gifs/steve-ring-kerr-T9eDSuYfZFEvS",
        "https://giphy.com/gifs/ytwfxx-okay-jimmy-xT9IgxiUfXHycuUkRW",
        "https://giphy.com/gifs/ytwfxx-okay-gretchen-xT9IgKwHdgLeMnnzA4",
        "https://giphy.com/gifs/usfigureskating-excited-countdown-xT9IgFgtB7U5MmugBq"
      ];
      break;
    case 8:
      options = [
        "https://giphy.com/gifs/2pVNVd922Igak",
        "https://giphy.com/gifs/eight-ball-fkeLNBr7pdr0c",
        "https://giphy.com/gifs/movie-trailer-oceans-8-l1IBhDnroZXqcYZ8Y",
        "https://giphy.com/gifs/quentin-tarantino-the-h8ful-eight-hateful-3o85xARMUXJxw0OsXm"
      ];
      break;
    case 9:
      options = [
        "https://giphy.com/gifs/heyarnold-nickelodeon-hey-arnold-xUNd9XVZCTO4bBRZrW",
        "https://giphy.com/gifs/rupaulsdragrace-3oKIP7wjzdzjbjLugg"
      ];
      break;
    case 10:
      options = [
        "https://giphy.com/gifs/mrw-someone-brady-ar4x1w44umngk",
        "https://giphy.com/gifs/fWh7ETXumAQIwRLwwk",
        "https://giphy.com/gifs/retro-night-flight-8c6IfP6VuSzNVutmDS",
        "https://giphy.com/gifs/reaction-EBPvJ8wA04Kc0",
        "https://giphy.com/gifs/Andrea-ice-cream-thats-a-10-taste-tester-Mgdr3suayJD5S"
      ];
      break;
    case 11:
      options = [
        "https://giphy.com/gifs/pretty-eleven-stranger-things-3o6ZtcSdUdVoKxMldS",
        "https://giphy.com/gifs/matt-smith-eleventh-doctor-glasses-sWQLSdcRTcJKU",
        "https://giphy.com/gifs/studiosoriginals-26xBKJclSF8d57UWs"
      ];
      break;
    case 12:
      options = [
        "https://giphy.com/gifs/marcelom12-football-marcelo-vieira-xUNda5RSVWLzb5BET6",
        "https://giphy.com/gifs/3oriNZ6hld6X2gEf28"
      ];
      break;
    case 13:
      options = [
        "https://giphy.com/gifs/digg-friday-the-13th-galentines-day-s9FnbSA9469AQ",
        "https://giphy.com/gifs/verizon-1zl3C2c7U6BYCykQPx",
        "https://giphy.com/gifs/cry-cnbc-prime-deal-or-no-236Wx01HDmb4TET9W2",
      ];
      break;
    case 14:
      options = [
        "https://giphy.com/gifs/verizon-nfl-vzup-verizon-up-1SB6rvYNo0Gz3Z9mtH",
        "https://giphy.com/gifs/26ybx8ut3nQI4gss8"
      ];
      break;
    case 15:
      options = [
        "https://giphy.com/gifs/l0HlAK9sXG6cVmh7G",
        "https://giphy.com/gifs/patriots-new-england-patriots-chris-hogan-gopats-9tXo3bhyz5WBDa9RuC"
      ];
      break;
    case 16:
      options = [
        "https://giphy.com/gifs/26FL1A8J4nrIL55L2",
        "https://giphy.com/gifs/ptm-16-portugal-the-man-easy-tiger-2dqNrc8eybPRUfCU29",
        "https://giphy.com/gifs/sixteen-48AYmkWHo8Ccw"
      ];
      break;
    case 17:
      options = [
        "https://giphy.com/gifs/ultramusic-music-video-lyrics-GEHOy4E7Yze48",
        "https://giphy.com/gifs/fcbayern-fc-bayern-xT0xePAbkSsyH9QlaM",
        "https://giphy.com/gifs/season-15-the-simpsons-15x3-3orife84U4IEf8w6hG"
      ];
      break;
    case 18:
      options = [
        "https://giphy.com/gifs/sebastian-bach-aYuPe5QOqHAVq",
        "https://giphy.com/gifs/cincinnati-bengals-aj-green-RIj3lbRYLYvXfOs6Sm"
      ];
      break;
    case 19:
      options = [
        "https://giphy.com/gifs/season-4-the-simpsons-4x14-xT5LMNN3Ploqhqtx5K",
        "https://giphy.com/gifs/nbcschicago-chicago-blackhawks-jonathan-toews-2tLz8oQ4vxLx1zoOF3"
      ];
      break;
    case 20:
      options = [
        "https://giphy.com/gifs/CMNHospitals-childrens-miracle-network-hospitals-kid-pediatric-patients-3dkWoKKGdEbz1JCNvY",
        "https://giphy.com/gifs/holiday-december-day-20-l0MYO6KvZeNjc1LQk",
        "https://giphy.com/gifs/4l98ByikbiRNK",
        "https://giphy.com/gifs/syfy-sharknado-4-the-4th-awakens-3owyp2xdrGboHrEDII"
      ];
      break;
    case 21:
      options = [
        "https://giphy.com/gifs/verizon-nfl-vzup-verizon-up-2A5zkoFmNJvK157Ma6",
        "https://giphy.com/gifs/beyonce-alcohol-gif-2YZyOXqYg2lWM",
      ];
      break;
    case 22:
      options = [
        "https://giphy.com/gifs/3ohzUl31ndZyEAypCU",
        "https://giphy.com/gifs/mark-ingram-pHXHbMcDpOxSurhZ00",
      ];
      break;
    case 23:
      options = [
        "https://giphy.com/gifs/miley-cyrus-23-f0wiJWhJEJxEk",
        "https://giphy.com/gifs/mini-italia-1zKvo9Owkgm6aENMn7",
        "https://giphy.com/gifs/basketball-nba-sK7GsXcQhIAjC"
      ];
      break;
    case 24:
      options = [
        "https://giphy.com/gifs/jack-bauer-24-fox-live-another-day-M9mTAQZM1jIn6",
        "https://giphy.com/gifs/24-i2VXCycb7X7b2",
        "https://giphy.com/gifs/freeman-devonta-uFkhzT1gOtyUESm7uq"
      ];
      break;
    case 25:
      options = [
        "https://giphy.com/gifs/CMNHospitals-childrens-miracle-network-hospitals-kid-pediatric-patients-3JP8XDbLr9FVEq66Xe",
        "https://giphy.com/gifs/greenwave-tulane-wyatt-wbb-25-basketball-toss-fivQD3JZXDWjesImsY",
        "https://giphy.com/gifs/birthday-25-3oriNSevfPEs37Fex2"
      ];
      break;
    case 26:
      options = [
        "https://giphy.com/gifs/26FLiEH99DGnhEck8",
      ];
      break;
    case 27:
      options = [
        "https://giphy.com/gifs/animation-ben-stiller-madagascar-Ws8uCSo4tZJAI",
        "https://giphy.com/gifs/bundesliga-island-iceland-52Fle542NauCzo2QMi"
      ];
      break;
    case 28:
      options = [
        "https://giphy.com/gifs/warnerarchive-warner-archive-elia-kazan-splendor-in-the-grass-l0HlOm5wPiaZBhzAk",
        "https://giphy.com/gifs/komplex28-cyberpunk-conspiracy-speculative-fiction-5xtDarsM8jmOJtlOeTm"
      ];
      break;
    case 29:
      options = [
        "https://giphy.com/gifs/verizon-nfl-vzup-verizon-up-1zgdLTZEWcmAkwA6ei",
        "https://giphy.com/gifs/l0HlRPGDG8PPfdH1K"
      ];
      break;
    case 30:
      options = [
        "https://giphy.com/gifs/CMNHospitals-childrens-miracle-network-hospitals-kid-pediatric-patients-1dIYE1CwFyTTbiOSiy",
        "https://giphy.com/gifs/lego-party-birthday-4qKNnSi9RpoA"
      ];
      break;
    case 31:
      options = [
        "https://giphy.com/gifs/26FKVBzlvrZrhUjgA",
        "https://giphy.com/gifs/80s-1980s-ulysses-31-14L2F3Fcwrv0s"
      ];
      break;
    case 32:
      options = [
        "https://giphy.com/gifs/greenwave-tulane-32-galic-2whb6mS2k6K0S6cvzN",
      ];
      break;
    case 33:
      options = [
        "https://giphy.com/gifs/33ProduccionesyManagement-logo-33-33producciones-xjca8t2mjltnS8mjQs",
        "https://giphy.com/gifs/wnba-storm-seattle-sami-whitcomb-3FnLxdWAWoH251Yd9h"
      ];
      break;
    case 34:
      options = [
        "https://giphy.com/gifs/nba-expression-xThtapEhRNWjTVA1ry",
        "https://giphy.com/gifs/geekandsundry-reaction-l0IyaQkcJxTwsaGM8",
        "https://giphy.com/gifs/greenwave-kenny-34-madzarevic-1d5O0wQUDg42V3Jlat"
      ];
      break;
    case 35:
      options = [
        "https://giphy.com/gifs/msufootball-football-celebration-33JFRwwxmI7RQCK5Lk",
        "https://giphy.com/gifs/nba-kevin-durant-locker-room-1iPuyigXE5ihDgd6wJ",
        "https://giphy.com/gifs/CMNHospitals-cmnh-miracle-kid-pediatric-patients-4TcXGGoBKgrMKDsTkK",
        "https://giphy.com/gifs/nba-marvin-bagley-iii-ftdF8p0dDiNrpI2XuN"
      ];
      break;
    case 36:
      options = [
        "https://giphy.com/gifs/sgrubbs-26mZJY1v6xQkOtcTDT"
      ];
      break;
    case 37:
      options = [
        "https://giphy.com/gifs/red-lettering-bubble-3o7TKP8DAP3AmTd1tK",
        "https://giphy.com/gifs/nbcsboston-boston-celtics-nbc-sports-td-garden-5T05Og08y7QGdD4bUH"
      ];
      break;
    case 38:
      options = [
        "https://giphy.com/gifs/silly-absurd-not-serious-3oFzlZCZJMJcNUAYOQ",
      ];
      break;
    case 39:
      options = [
        "https://tenor.com/view/fae-39-uanl-gif-7701876"
      ];
      break;
    case 40:
      options = [
        "https://giphy.com/gifs/I7U8SSKUVsRoI",
        "https://giphy.com/gifs/nbcschicago-lopez-40-reynaldo-5BYExnfbRHEj3YHNET"
      ];
      break;
    case 41:
      options = [
        "https://giphy.com/gifs/dukembb-duke-basketball-mens-f9R7JjfdITqYWelB56"
      ];
      break;
    case 42:
      options = [
        "https://giphy.com/gifs/nd-FPHNOHTwh372M"
      ];
      break;
    case 43:
      options = [
        "https://giphy.com/gifs/fiba-52FzbDRW7MUXAQAjKP",
      ];
      break;
    case 44:
      options = [
        "https://giphy.com/gifs/USCTrojans-usc-trojan-trojans-5SzvFZDYF3zzyVgzc7",
        "https://giphy.com/gifs/nba-fan-1dOKU0ZGEHokQkoCAM"
      ];
      break;
    case 45:
      options = [
        "https://giphy.com/gifs/r7comunicacao-ponto45-clubedetiro45-cURH1unx93rufEfhp4"
      ];
      break;
    case 46:
      options = [
        "https://giphy.com/gifs/nbcsboston-boston-celtics-nbc-sports-td-garden-tZDz3CZ8EFDIo98gA4"
      ];
      break;
    case 47:
      options = [
        "https://giphy.com/gifs/4x19-Z9MY28M7Co98I",
      ];
      break;
    case 48:
      options = [
        "https://giphy.com/gifs/giffffr-tyttpH6Hv6xDVpiqaJ2"
      ];
      break;
    case 49:
      options = [
        "https://upload.wikimedia.org/wikipedia/commons/a/a6/Euclid%27s-algorithm-example-49.gif"
      ];
      break;
    case 50:
      options = [
        "https://giphy.com/gifs/birthday-cake-happy-3o85xJMBIk9mmyemvS"
      ];
      break;
    case 51:
      options = [
      ];
      break;
    case 52:
      options = [
      ];
      break;
    case 53:
      options = [
      ];
      break;
    case 54:
      options = [
      ];
      break;
    case 55:
      options = [
      ];
      break;
    case 56:
      options = [
      ];
      break;
    case 57:
      options = [
      ];
      break;
    case 58:
      options = [
      ];
      break;
    case 59:
      options = [
      ];
      break;
    case 60:
      options = [
        "https://giphy.com/gifs/paidoff-trutv-paid-off-po113-1xmlZjWzQsUMHcO22Q",
      ];
      break;
    case 61:
      options = [
      ];
      break;
    case 62:
      options = [
      ];
      break;
    case 63:
      options = [
      ];
      break;
    case 64:
      options = [
      ];
      break;
    case 65:
      options = [
      ];
      break;
    case 66:
      options = [
      ];
      break;
    case 67:
      options = [
      ];
      break;
    case 68:
      options = [
      ];
      break;
    case 69:
      options = [
        "https://giphy.com/gifs/whats-your-number-Km3veWaZ6Drzi"
      ];
      break;
    case 70:
      options = [
      ];
      break;
    case 71:
      options = [
      ];
      break;
    case 72:
      options = [
      ];
      break;
    case 73:
      options = [
      ];
      break;
    case 74:
      options = [
      ];
      break;
    case 75:
      options = [
      ];
      break;
    case 76:
      options = [
      ];
      break;
    case 77:
      options = [
      ];
      break;
    case 78:
      options = [
      ];
      break;
    case 79:
      options = [
      ];
      break;
    case 80:
      options = [
      ];
      break;
    case 81:
      options = [
      ];
      break;
    case 82:
      options = [
      ];
      break;
    case 83:
      options = [
      ];
      break;
    case 84:
      options = [
      ];
      break;
    case 85:
      options = [
      ];
      break;
    case 86:
      options = [
      ];
      break;
    case 87:
      options = [
      ];
      break;
    case 88:
      options = [
      ];
      break;
    case 89:
      options = [
      ];
      break;
    case 80:
      options = [
      ];
      break;
    case 91:
      options = [
      ];
      break;
    case 92:
      options = [
      ];
      break;
    case 93:
      options = [
      ];
      break;
    case 94:
      options = [
      ];
      break;
    case 95:
      options = [
      ];
      break;
    case 96:
      options = [
      ];
      break;
    case 97:
      options = [
      ];
      break;
    case 98:
      options = [
      ];
      break;
    case 99:
      options = [
      ];
      break;
    case 100:
      options = [
        "https://giphy.com/explore/100-percent"
      ];
      break;
    default:
      options = ["https://giphy.com/gifs/the-wachowskis-MFje9gRTYIL28"];
  }
  return gifFrom(options);
}

function gifFrom(options) {
  return options[Math.floor(Math.random() * options.length)];
}

module.exports = {
  getGIFFor : getGIFFor
};

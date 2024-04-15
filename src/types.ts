export type movie = {
  title: string;
  description: string;
  genre: string[];
  cast: string[];
  director: string | null;
  duration: string;
  showTimes: showTime[];
  images: string[];
  url: string;
};

export type dictionary = {
  [key: string]: string | null;
};

export type showTime = {
  theater: string;
  screenType: string;
  versions: string[];
  time: string;
  date: string;
};

export type cinema = {
  name: string;
  address: string;
  url: string;
};

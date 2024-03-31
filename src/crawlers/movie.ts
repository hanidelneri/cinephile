export type movie = {
  title: string;
  description: string;
  genre: string;
  cast: string | null;
  director: string | null;
  duration: string;
  showTimes: showTime[];
  images: string[];
};

export type dictionary = {
  [key: string]: string | null;
};

export type showTime = {
  theater: string;
  screenType: string;
  versions: string[];
  time: string;
};

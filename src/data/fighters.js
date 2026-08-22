/**
 * fighters.js — the pool every build is scavenged from.
 *
 * Real fighters, real divisions. The six grades on each entry are this project's
 * own fictional call, not a stat pulled from anywhere official — same convention
 * the sports-game genre has always used for player ratings. Nothing here claims to
 * be a real ranking; it exists to make the wheel land on someone worth stealing
 * from.
 *
 * Deliberately mixed quality per division: each roster carries its original
 * champion/contender core (elite, A-/A/S-heavy) plus two added bands — solid
 * gatekeepers and journeymen (B-/B/B+, roughly "ok to good") and real
 * lower-tier or one-dimensional fighters (C+ down to D, "bad"). A pool that's
 * all elite stats makes every steal safe; the weaker bands exist so the wheel
 * can hand you a genuinely bad tool and the floor penalty in buildEngine.js
 * has something real to bite on.
 *
 * era: 'legend' (career is over or defined by a past peak) | 'current' (active
 * top-of-division form) | 'both' (defined a generation and is still doing it).
 * It's flavor on the card, not read by the scoring engine.
 */

const F = (name, era, Striking, Power, Wrestling, Submissions, Cardio, Chin) => ({
  name, era, grades: { Striking, Power, Wrestling, Submissions, Cardio, Chin },
});

export const FIGHTER_POOL = {
  "Men's Flyweight": [
    F('Demetrious Johnson', 'legend', 'A-', 'B', 'A+', 'A', 'S', 'A-'),
    F('Deiveson Figueiredo', 'both', 'A', 'A', 'B+', 'B+', 'B+', 'A'),
    F('Brandon Moreno', 'current', 'B+', 'B', 'B', 'A', 'A', 'A-'),
    F('Alexandre Pantoja', 'current', 'B+', 'B', 'A-', 'A', 'A-', 'A'),
    F('Henry Cejudo', 'legend', 'B+', 'B', 'A+', 'B+', 'B+', 'A-'),
    F('Joseph Benavidez', 'legend', 'B+', 'B+', 'B+', 'B+', 'A-', 'B'),
    F('Kai Kara-France', 'current', 'A-', 'A-', 'C+', 'C+', 'B+', 'B'),
    F('Sergio Pettis', 'current', 'B', 'B-', 'B+', 'B', 'B+', 'B+'),
    F('Tim Elliott', 'legend', 'B-', 'C+', 'A-', 'B', 'A', 'B'),
    F('Matt Schnell', 'current', 'B', 'B-', 'B', 'B+', 'B', 'B-'),
    F('David Dvořák', 'current', 'B', 'B-', 'B+', 'B', 'B', 'B-'),
    F('Su Mudaerji', 'current', 'C+', 'B', 'C', 'C', 'C+', 'C+'),
    F('Cody Durden', 'current', 'C', 'C-', 'B-', 'C+', 'B-', 'C+'),
    F('Jake Hadley', 'current', 'C+', 'C', 'C+', 'C', 'C+', 'C'),
  ],
  "Men's Bantamweight": [
    F('Aljamain Sterling', 'both', 'B', 'B-', 'A', 'A', 'A+', 'A-'),
    F('Petr Yan', 'both', 'A', 'A-', 'A-', 'B+', 'A-', 'A-'),
    F('Sean O’Malley', 'current', 'A+', 'A', 'C+', 'C+', 'B', 'B+'),
    F('Merab Dvalishvili', 'current', 'B-', 'C+', 'S', 'B+', 'S', 'A'),
    F('Cory Sandhagen', 'current', 'A', 'B+', 'B', 'B+', 'A-', 'B+'),
    F('Dominick Cruz', 'legend', 'A-', 'B-', 'A', 'B', 'A', 'B'),
    F('T.J. Dillashaw', 'legend', 'A', 'A-', 'A-', 'B', 'B+', 'B'),
    F('Renan Barão', 'legend', 'A-', 'A-', 'B+', 'B+', 'B+', 'B'),
    F('Marlon Vera', 'current', 'A-', 'A-', 'B', 'B+', 'B+', 'B+'),
    F('Rob Font', 'current', 'A-', 'B', 'C+', 'C', 'B+', 'B'),
    F('Chris Gutierrez', 'current', 'B+', 'B-', 'C', 'C+', 'B', 'B'),
    F('Adrian Yanez', 'current', 'B+', 'B', 'C', 'C', 'B-', 'C+'),
    F('Ricky Simon', 'current', 'C', 'C', 'B', 'C+', 'B-', 'C+'),
    F('Brian Kelleher', 'legend', 'C+', 'C+', 'C', 'B-', 'C+', 'C'),
    F('Da’Mon Blackshear', 'current', 'C', 'C-', 'C+', 'B', 'C+', 'C'),
  ],
  "Men's Featherweight": [
    F('Alexander Volkanovski', 'both', 'A+', 'A', 'A-', 'B+', 'A+', 'A'),
    F('Max Holloway', 'both', 'S', 'B+', 'B', 'B', 'S', 'A+'),
    F('José Aldo', 'legend', 'A+', 'A+', 'A-', 'B+', 'A-', 'A-'),
    F('Ilia Topuria', 'current', 'A', 'A+', 'B+', 'B+', 'B+', 'A-'),
    F('Brian Ortega', 'current', 'B+', 'B', 'B', 'S', 'B+', 'B+'),
    F('Yair Rodríguez', 'current', 'A-', 'B+', 'B-', 'B+', 'B', 'B'),
    F('Frankie Edgar', 'legend', 'B+', 'B-', 'A', 'B+', 'A+', 'B'),
    F('Zabit Magomedsharipov', 'legend', 'A-', 'B', 'A-', 'A', 'A-', 'B'),
    F('Chan Sung Jung', 'legend', 'B+', 'A-', 'B', 'A-', 'A-', 'B+'),
    F('Dan Ige', 'current', 'B+', 'B', 'C+', 'C', 'B+', 'A-'),
    F('Calvin Kattar', 'current', 'A-', 'B', 'C', 'C', 'B+', 'B+'),
    F('Sodiq Yusuff', 'current', 'B+', 'B', 'C+', 'C', 'B', 'B-'),
    F('Giga Chikadze', 'current', 'B', 'B-', 'C-', 'C', 'C+', 'C'),
    F('Nate Landwehr', 'current', 'C+', 'C', 'C+', 'B-', 'B', 'C+'),
    F('Herbert Burns', 'current', 'C', 'C', 'B-', 'B', 'C+', 'C-'),
  ],
  "Men's Lightweight": [
    F('Khabib Nurmagomedov', 'legend', 'B+', 'B+', 'S', 'A', 'A+', 'A+'),
    F('Islam Makhachev', 'current', 'A-', 'B+', 'S', 'A', 'A+', 'A'),
    F('Charles Oliveira', 'both', 'A-', 'B+', 'B', 'S', 'A-', 'B'),
    F('Justin Gaethje', 'both', 'A+', 'S', 'B', 'B-', 'A-', 'A-'),
    F('Conor McGregor', 'legend', 'A+', 'A+', 'B-', 'B', 'B', 'B'),
    F('Dustin Poirier', 'both', 'A', 'A', 'B', 'A-', 'A', 'A-'),
    F('Michael Chandler', 'current', 'A-', 'A', 'A-', 'B', 'A-', 'B+'),
    F('Tony Ferguson', 'legend', 'A-', 'B+', 'B+', 'A-', 'S', 'A'),
    F('Frankie Edgar', 'legend', 'B+', 'B-', 'A', 'B+', 'A+', 'B'),
    F('Nate Diaz', 'legend', 'A-', 'B', 'B-', 'A-', 'A+', 'A'),
    F('Arman Tsarukyan', 'current', 'A-', 'B+', 'A-', 'B+', 'A', 'B+'),
    F('Bobby Green', 'legend', 'B', 'B-', 'C+', 'C+', 'B', 'B-'),
    F('Drew Dober', 'current', 'B+', 'B', 'C', 'C', 'B-', 'B'),
    F('Jim Miller', 'legend', 'B-', 'C+', 'B', 'A-', 'B+', 'B-'),
    F('Clay Guida', 'legend', 'C+', 'C', 'B', 'C+', 'A-', 'C+'),
    F('Terrance McKinney', 'current', 'B', 'B+', 'C-', 'C-', 'C', 'C'),
    F('Joe Lauzon', 'legend', 'C', 'C', 'C+', 'B', 'C+', 'C-'),
  ],
  "Men's Welterweight": [
    F('Georges St-Pierre', 'legend', 'A', 'B+', 'S', 'A-', 'A', 'A'),
    F('Kamaru Usman', 'both', 'A-', 'A', 'A+', 'B+', 'A', 'A+'),
    F('Leon Edwards', 'both', 'A', 'A-', 'B+', 'B', 'A-', 'A-'),
    F('Belal Muhammad', 'current', 'B+', 'B', 'A', 'B+', 'A+', 'A'),
    F('Colby Covington', 'current', 'B', 'B-', 'A+', 'B', 'S', 'A'),
    F('Nick Diaz', 'legend', 'A-', 'B', 'B-', 'A-', 'A+', 'A+'),
    F('Robbie Lawler', 'legend', 'A', 'A+', 'B', 'B', 'B+', 'A+'),
    F('Tyron Woodley', 'legend', 'B+', 'A', 'A-', 'B', 'B+', 'B+'),
    F('Jorge Masvidal', 'legend', 'A', 'A-', 'B', 'B', 'B+', 'B+'),
    F('Shavkat Rakhmonov', 'current', 'A-', 'A-', 'A-', 'A', 'A-', 'B+'),
    F('Neil Magny', 'current', 'B', 'B-', 'B', 'C+', 'A-', 'B'),
    F('Michael Chiesa', 'current', 'C+', 'C', 'A-', 'A-', 'B+', 'B'),
    F('Sean Brady', 'current', 'B', 'B', 'B+', 'B', 'B', 'B-'),
    F('Court McGee', 'legend', 'C', 'C', 'B-', 'C+', 'B', 'C+'),
    F('Bryan Barberena', 'current', 'C+', 'C+', 'C', 'C', 'B-', 'B-'),
    F('Randy Brown', 'current', 'C+', 'C', 'C+', 'C', 'C+', 'C+'),
  ],
  "Men's Middleweight": [
    F('Israel Adesanya', 'both', 'A+', 'A', 'C+', 'C+', 'B+', 'B'),
    F('Anderson Silva', 'legend', 'S', 'A', 'B-', 'A-', 'B+', 'A-'),
    F('Dricus du Plessis', 'current', 'B+', 'B+', 'A-', 'B+', 'A', 'A-'),
    F('Sean Strickland', 'current', 'A-', 'B+', 'B', 'C+', 'A+', 'A'),
    F('Robert Whittaker', 'current', 'A', 'A-', 'B', 'B', 'A-', 'B+'),
    F('Khamzat Chimaev', 'current', 'B+', 'A-', 'S', 'A', 'A-', 'B+'),
    F('Chael Sonnen', 'legend', 'B', 'B', 'A+', 'C+', 'A', 'B+'),
    F('Yoel Romero', 'legend', 'A-', 'A+', 'A-', 'B', 'B-', 'A-'),
    F('Michael Bisping', 'legend', 'B+', 'B', 'B-', 'B-', 'A-', 'B+'),
    F('Brad Tavares', 'current', 'B', 'B-', 'B', 'C+', 'B', 'B'),
    F('Derek Brunson', 'legend', 'B-', 'B+', 'B+', 'C+', 'B', 'C+'),
    F('Andre Muniz', 'current', 'C+', 'C+', 'B', 'A-', 'B', 'C+'),
    F('Chris Weidman', 'legend', 'C+', 'B-', 'B', 'C+', 'C+', 'C'),
    F('Uriah Hall', 'legend', 'B', 'B+', 'C-', 'C', 'C', 'C+'),
    F('Kelvin Gastelum', 'current', 'C+', 'C+', 'C+', 'B-', 'C+', 'C'),
  ],
  "Men's Light Heavyweight": [
    F('Jon Jones', 'both', 'A', 'A', 'A+', 'B+', 'A-', 'A-'),
    F('Alex Pereira', 'current', 'A+', 'S', 'C+', 'C+', 'B', 'A-'),
    F('Jiří Procházka', 'current', 'A', 'A', 'B', 'B+', 'A-', 'B'),
    F('Jamahal Hill', 'current', 'A-', 'A-', 'B-', 'B-', 'B+', 'B'),
    F('Daniel Cormier', 'legend', 'B+', 'B+', 'S', 'B+', 'A', 'A'),
    F('Anthony Johnson', 'legend', 'A-', 'S', 'B+', 'B-', 'B-', 'B'),
    F('Glover Teixeira', 'legend', 'B+', 'A-', 'B+', 'A', 'A', 'S'),
    F('Dominick Reyes', 'legend', 'A-', 'A-', 'B', 'B', 'B+', 'B'),
    F('Thiago Santos', 'legend', 'A-', 'A', 'B-', 'B-', 'B', 'B'),
    F('Anthony Smith', 'legend', 'B', 'B-', 'C+', 'B+', 'B', 'C+'),
    F('Johnny Walker', 'current', 'B+', 'A-', 'C', 'C', 'C+', 'C'),
    F('Dustin Jacoby', 'current', 'B', 'B-', 'C', 'C', 'B-', 'B-'),
    F('Ovince Saint Preux', 'legend', 'C+', 'B-', 'B-', 'C+', 'C+', 'B'),
    F('Devin Clark', 'current', 'C', 'C', 'B-', 'C', 'B', 'C+'),
    F('Alonzo Menifield', 'current', 'C+', 'B', 'C', 'C-', 'C', 'C'),
  ],
  "Men's Heavyweight": [
    F('Jon Jones', 'both', 'A', 'A', 'A+', 'B+', 'A-', 'A-'),
    F('Francis Ngannou', 'legend', 'A-', 'S', 'B', 'C+', 'B', 'A-'),
    F('Tom Aspinall', 'current', 'A-', 'A', 'B+', 'A-', 'B+', 'B+'),
    F('Stipe Miocic', 'legend', 'A', 'A', 'B+', 'B', 'A', 'A+'),
    F('Ciryl Gane', 'current', 'A', 'A-', 'B', 'B-', 'A-', 'B'),
    F('Curtis Blaydes', 'current', 'B', 'B+', 'A', 'B-', 'A-', 'B'),
    F('Sergei Pavlovich', 'current', 'B+', 'S', 'B-', 'C+', 'B-', 'B'),
    F('Cain Velasquez', 'legend', 'A-', 'A', 'A-', 'B', 'A+', 'B+'),
    F('Fabrício Werdum', 'legend', 'B', 'B', 'B', 'S', 'B+', 'B'),
    F('Junior dos Santos', 'legend', 'A', 'A+', 'C+', 'C+', 'B', 'A-'),
    F('Marcin Tybura', 'current', 'B-', 'B', 'B', 'C+', 'B', 'B-'),
    F('Walt Harris', 'legend', 'B', 'B+', 'C', 'C', 'C+', 'B-'),
    F('Andrei Arlovski', 'legend', 'B', 'B', 'C+', 'C+', 'C', 'C'),
    F('Derrick Lewis', 'current', 'B', 'S', 'C-', 'D+', 'C-', 'B-'),
    F('Jairzinho Rozenstruik', 'current', 'B+', 'A-', 'C-', 'D+', 'C', 'C'),
    F('Tai Tuivasa', 'current', 'B+', 'A-', 'C-', 'D', 'C-', 'C+'),
  ],
  "Women's Strawweight": [
    F('Zhang Weili', 'both', 'A+', 'A-', 'B+', 'B+', 'A', 'A-'),
    F('Rose Namajunas', 'both', 'A', 'B+', 'B', 'B+', 'B+', 'B'),
    F('Joanna Jędrzejczyk', 'legend', 'A+', 'A-', 'B', 'C+', 'A-', 'B'),
    F('Carla Esparza', 'legend', 'B', 'B-', 'A-', 'A-', 'A-', 'B+'),
    F('Yan Xiaonan', 'current', 'A-', 'B+', 'B', 'B', 'A-', 'B+'),
    F('Marina Rodriguez', 'current', 'A-', 'B+', 'B-', 'B', 'A-', 'B'),
    F('Tatiana Suarez', 'current', 'B', 'B', 'S', 'A', 'A', 'B+'),
    F('Virna Jandiroba', 'current', 'B', 'B-', 'A-', 'A', 'A-', 'B+'),
    F('Angela Hill', 'current', 'B', 'B-', 'C+', 'C+', 'B+', 'B'),
    F('Jessica Penne', 'legend', 'B-', 'C+', 'B', 'B', 'B', 'B-'),
    F('Cynthia Calvillo', 'current', 'B-', 'C+', 'B', 'B', 'B', 'C+'),
    F('Mackenzie Dern', 'current', 'C', 'C', 'B-', 'S', 'B-', 'C'),
    F('Michelle Waterson', 'legend', 'B-', 'C', 'C+', 'B', 'C+', 'C'),
    F('Polyana Viana', 'current', 'C+', 'C', 'C+', 'B', 'C', 'C-'),
  ],
  "Women's Flyweight": [
    F('Valentina Shevchenko', 'both', 'A+', 'A-', 'A-', 'A-', 'A', 'A-'),
    F('Alexa Grasso', 'current', 'A-', 'B', 'B', 'A-', 'A-', 'B'),
    F('Jessica Andrade', 'both', 'A-', 'A', 'A-', 'B', 'A', 'A+'),
    F('Katlyn Chookagian', 'current', 'B+', 'B', 'B-', 'C+', 'A-', 'B'),
    F('Manon Fiorot', 'current', 'A', 'B+', 'B', 'C+', 'A-', 'B+'),
    F('Taila Santos', 'current', 'B', 'B', 'A-', 'B+', 'A-', 'B'),
    F('Andrea Lee', 'current', 'B', 'B-', 'C+', 'C+', 'B', 'B-'),
    F('Lauren Murphy', 'legend', 'B-', 'B-', 'B', 'C+', 'B', 'B'),
    F('Jennifer Maia', 'legend', 'B-', 'B-', 'B', 'B', 'B', 'C+'),
    F('Viviane Araújo', 'current', 'B-', 'B-', 'C', 'C', 'C+', 'C+'),
    F('Maycee Barber', 'current', 'B', 'B', 'C', 'C-', 'C', 'C'),
    F('Jasmine Jasudavicius', 'current', 'C+', 'C', 'B-', 'C+', 'C+', 'C'),
  ],
  "Women's Bantamweight": [
    F('Amanda Nunes', 'legend', 'A+', 'S', 'A-', 'A-', 'A', 'A'),
    F('Ronda Rousey', 'legend', 'B-', 'B', 'A', 'S', 'B', 'C+'),
    F('Julianna Peña', 'current', 'B', 'B', 'A-', 'A-', 'A', 'A-'),
    F('Raquel Pennington', 'current', 'B', 'B-', 'B+', 'B', 'A', 'B+'),
    F('Holly Holm', 'both', 'A', 'B+', 'B-', 'B-', 'A-', 'B+'),
    F('Miesha Tate', 'legend', 'B', 'B-', 'B+', 'B+', 'A-', 'B+'),
    F('Ketlen Vieira', 'current', 'B+', 'B', 'B+', 'B', 'A-', 'B+'),
    F('Irene Aldana', 'current', 'A-', 'B+', 'C', 'C', 'B', 'C+'),
    F('Macy Chiasson', 'current', 'B', 'B', 'B-', 'C+', 'B-', 'B-'),
    F('Sara McMann', 'legend', 'C+', 'B-', 'A-', 'C+', 'B', 'B'),
    F('Karol Rosa', 'current', 'C+', 'C', 'B-', 'C+', 'C+', 'C'),
    F('Norma Dumont', 'current', 'B-', 'C+', 'C', 'C-', 'C+', 'C'),
    F('Yana Santos', 'current', 'C+', 'C', 'C+', 'C', 'C+', 'C-'),
  ],
};

export const poolFor = (poolId, divisions) => {
  const allowed = new Set(divisions);
  const out = {};
  for (const [div, list] of Object.entries(FIGHTER_POOL)) {
    if (allowed.has(div)) out[div] = list;
  }
  return out;
};

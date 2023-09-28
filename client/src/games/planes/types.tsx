/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

export type VehicleType = "car" | "plane" | "tank";
export const VehicleTypes: VehicleType[] = ["car", "plane", "tank"];

export interface Vehicle {
  type: VehicleType;
  name: string;
  description: string;
}

export const Vehicles: Vehicle[] = [
  // cars
  {
    type: "car",
    name: "SUV",
    description:
      "A sport utility vehicle is a car classification that combines elements of road-going passenger cars with features from off-road vehicles, such as raised ground clearance and four-wheel drive.",
  },
  {
    type: "car",
    name: "Hatchback",
    description:
      "A hatchback is a car body configuration with a rear door that swings upward to provide access to the main interior of the car as a cargo area rather than just to a separated trunk.",
  },
  {
    type: "car",
    name: "Sedan",
    description:
      "A sedan or saloon is a passenger car in a three-box configuration with separate compartments for an engine, passengers, and cargo.",
  },
  {
    type: "car",
    name: "Coupe",
    description:
      "A coupe or coupé is a passenger car with a sloping or truncated rear roofline and two doors.",
  },
  {
    type: "car",
    name: "Station wagon",
    description:
      "A station wagon or estate car, is an automotive body-style variant of a sedan/saloon with its roof extended rearward over a shared passenger/cargo volume with access at the back via a third or fifth door, instead of a trunk/boot lid.",
  },
  {
    type: "car",
    name: "Convertible",
    description:
      "A convertible or cabriolet is a passenger car that can be driven with or without a roof in place.",
  },
  {
    type: "car",
    name: "Minivan",
    description:
      "Minivan is a car classification for vehicles designed to transport passengers in the rear seating row, with reconfigurable seats in two or three rows.",
  },
  {
    type: "car",
    name: "Crossover",
    description:
      "A crossover, crossover SUV, or crossover utility vehicle is a type of automobile with an increased ride height that is built on unibody chassis construction shared with passenger cars, as opposed to traditional sport utility vehicles, which are built on a body-on-frame chassis construction similar to pickup trucks.",
  },
  {
    type: "car",
    name: "Sports car",
    description:
      "A sports car is a car designed with an emphasis on dynamic performance, such as handling, acceleration, top speed, the thrill of driving and racing capability.",
  },
  {
    type: "car",
    name: "Pickup truck",
    description:
      "A pickup truck or pickup is a light-duty truck that has an enclosed cabin, and a back end made up of a cargo bed that is enclosed by three low walls with no roof.",
  },
  // planes
  {
    type: "plane",
    name: "Airbus A380",
    description:
      "The Airbus A380 is a large wide-body airliner that was developed and produced by Airbus.",
  },
  {
    type: "plane",
    name: "Cargo plane",
    description:
      "A cargo aircraft is a fixed-wing aircraft that is designed or converted for the carriage of cargo rather than passengers.",
  },
  {
    type: "plane",
    name: "Boeing 757",
    description:
      "The Boeing 757 is an American narrow-body airliner designed and built by Boeing Commercial Airplanes.",
  },
  {
    type: "plane",
    name: "Boeing 767",
    description:
      "The Boeing 767 is a mid- to large-size, long-range, wide-body twin-engine jet airliner built by Boeing Commercial Airplanes.",
  },
  {
    type: "plane",
    name: "Boeing 747",
    description:
      "The Boeing 747 is a large, long-range wide-body airliner designed and manufactured by Boeing Commercial Airplanes in the United States between 1968 and 2023.",
  },
  {
    type: "plane",
    name: "Very light jet",
    description:
      "A very light jet, entry-level jet or personal jet, previously known as a microjet, is a category of small business jets that seat four to eight people.",
  },
  {
    type: "plane",
    name: "Business jet",
    description:
      "A business jet, private jet, or bizjet is a jet aircraft designed for transporting small groups of people, typically business executives and high-ranking associates.",
  },
  {
    type: "plane",
    name: "Airliner",
    description:
      "An airliner is a type of aircraft for transporting passengers and air cargo.",
  },
  {
    type: "plane",
    name: "Military plane",
    description:
      "It is used for wartime purposes. While passenger and cargo aircraft can also be military (rather than civilian), this label is for attack or defense aircraft. There are many types of military aircraft, according to their purposes. For instance, they could bombers, capable of transporting and dropping bombs or missiles; or fighter planes designed and equipped to intercept and shoot down targets in the air, reaching very high speeds in little time.",
  },
  {
    type: "plane",
    name: "Boeing 777",
    description:
      "The 777 is the world's largest twinjet and the most built wide-body airliner.",
  },
  // tanks
  {
    type: "tank",
    name: "Light",
    description:
      "A light tank is a tank variant initially designed for rapid movements in and out of combat, to outmaneuver heavier tanks.",
  },
  {
    type: "tank",
    name: "Battle",
    description:
      "A battle is an occurrence of combat in warfare between opposing military units of any number or size.",
  },
  {
    type: "tank",
    name: "Medium",
    description:
      "A medium tank is a classification of tanks, particularly prevalent during World War II which represented a compromise between the mobility oriented light tanks and the armour and armament oriented heavy tanks.",
  },
  {
    type: "tank",
    name: "Heavy",
    description:
      "Heavy tank is a term used to define a class of tanks produced from World War I through the end of the Cold War.",
  },
  {
    type: "tank",
    name: "M1 Abrams",
    description:
      "The M1 Abrams is a third-generation American main battle tank designed by Chrysler Defense and named for General Creighton Abrams.",
  },
  {
    type: "tank",
    name: "T-90",
    description:
      "The T-90 is a third-generation Russian main battle tank developed to replace the T-72.",
  },
  {
    type: "tank",
    name: "Tiger",
    description:
      "The Tiger I was a German heavy tank of World War II that operated beginning in 1942 in Africa and in the Soviet Union, usually in independent heavy tank battalions.",
  },
  {
    type: "tank",
    name: "Destroyer",
    description:
      "A tank destroyer, tank hunter or tank killer is a type of armoured fighting vehicle, predominantly intended for anti-tank duties.",
  },
  {
    type: "tank",
    name: "M60",
    description: "The M60 is an American second-generation main battle tank.",
  },
  {
    type: "tank",
    name: "Leopard",
    description:
      "The Kampfpanzer Leopard 1 is a main battle tank designed by Porsche and manufactured by Krauss-Maffei in West Germany, first entering service in 1965.",
  },
];

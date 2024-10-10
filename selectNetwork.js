import {
  POLYGON_PROVIDER,
  ETHEREUM_PROVIDER,
  SEPOLIA_PROVIDER,
} from "./daemon.js";

let provider;

const selectNetwork = (network) => {
  switch (network) {
    case "Polygon":
      provider = POLYGON_PROVIDER;
      break;
    case "Ethereum":
      privder = ETHEREUM_PROVIDER;
      break;
    case "Sepolia":
      provider = SEPOLIA_PROVIDER;
      break;
  }
};

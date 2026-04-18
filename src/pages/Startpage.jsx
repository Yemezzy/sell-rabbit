import React from 'react'
import { useState } from "react";
import { FaBars, FaFacebook, FaTelegram, FaTwitter } from 'react-icons/fa'
// import { Link } from 'react-router'


export const Startpage = () => {
  const [fromValue, setFromValue] = useState("");
  const rabbitPrice = 0.002; // 1 Rabbit = $0.002
  // const usdtPrice = 1;
  const [toValue, setToValue] = useState("");

  const handleFromChange = (e) => {
    const value = e.target.value;
    setFromValue(value);
    setToValue(( rabbitPrice * value).toFixed(2)); // convert USD → Rabbit
  };

  const formatNumber = (num) => {
    if (!num || isNaN(num)) return "0.00";
    return Number(num).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
<div className="bg-[#1D0729] text-white">
      <div className="p-3 ">
        <nav className="flex justify-between rounded-full text-white p-3 px-5 mdpx-0 md:px-10 items-center bg-[#2A0C3B]">
          <img
            src="https://nftswapstack.netlify.app/static/media/logo.3a5ddf90d6e3930972be.jfif"
            alt=""
            className="md:w-14 w-10 h-10 md:h-14 rounded-full"
          />

       
            <ul className="md:flex hidden gap-5  text-lg font-semibold">
              <li>Home</li>
              <li>About</li>
              <li>Roadmap</li>
              <li>Tokenomic</li>
              <li>Whitepaper</li>
            </ul>

          <button className="bg-[#D344B0] py-2 md:px-4 px-2 rounded-md">
            <p className="md:block hidden">Connect Wallet</p>
            <FaBars className="md:hidden block" />
          </button>
        </nav>
      </div>
      <div className="md:mt-16 mt-5 md:px-5 px-2">
        <p className="md:text-4xl text-2xl font-bold lllk text-center">
          Sell Rabbit Coin
        </p>
        <p className="mt-2 md:text-base text-sm">
         Trade your Rabbit Coin for usdt instantly with low cost fee.
         
        </p>

        <div className="bg-[#320E39] mt-5 md:p-5 p-2 rounded-2xl">
    <div className="flex items-center p-4 text-white">
      <div className="bg-[#1C0A25] rounded-2xl p-6 w-full max-w-md">

        {/* From Section */}
        <div className="bg-[#2B1A37] rounded-xl p-4 mb-">
          <p className="text-sm text-gray-300 mb-2">From:</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="https://nftswapstack.netlify.app/static/media/logo.3a5ddf90d6e3930972be.jfif" alt="usdt" className="w-8 h-8 rounded-full" />
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
            </div>
          </div>
        </div>
          <div className="flex justify-between items-center text-xs text-gray-400 mt-1 mb-4">
            <p>min sell: 5M rabbit</p>
          </div>

        {/* Arrow */}
        <div className="flex justify-center mb-4">
          <div className="bg-[#1C0A25] w-10 h-10 rounded-full flex items-center justify-center">
            <span className="text-xl">↓</span>
          </div>
        </div>

        {/* To Section */}
        <div className="bg-[#2B1A37] rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-300 mb-2">To:</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="https://static.cx.metamask.io/api/v1/tokenIcons/1/0xdac17f958d2ee523a2206206994597c13d831ec7.png" alt="rabbit" className="w-8 h-8 rounded-full" />
              <span className="font-semibold">USDT</span>
            </div>
            <div className="text-right">
              <input
                type="text"
                value={toValue}
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

        {/* Slippage + Button */}
        <div className="bg-[#2B1A37] rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-400 underline">Slippage Tolerance</p>
            <span className="bg-[#3A1C48] px-3 py-1 rounded-lg text-sm">
              Auto: 0.50%
            </span>
          </div>
          <button className="bg-[#14D9C4] text-black w-full py-3 rounded-xl font-bold text-lg hover:opacity-90 transition">
            Connect Wallet
          </button>
        </div>
          <div className="flex justify-between items-center text-xs text-gray-400 mt-3">
            <p>
              1 Rabbit ≈ ${(rabbitPrice).toFixed(4)} USDT
            </p>
            <p>Fee 20% USDT</p>
          </div>
      </div>
    </div>
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

        <div className="md:mt-20">
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
  )
}

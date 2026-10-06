import React from "react";
import { FaFacebook, FaTelegram, FaTwitter } from "react-icons/fa";

const Ended = () => {
  return (
    <div>

  
<div className="p-3">
  <nav className="flex justify-between rounded-full text-white p-3 px-5 md:px-10 items-center bg-[#2A0C3B]">
    <img
      src="https://nftswapstack.netlify.app/static/media/logo.3a5ddf90d6e3930972be.jfif"
      alt="Rabbit Coin logo"
      className="md:w-14 w-10 h-10 md:h-14 rounded-full"
    />

    <span className="font-bold text-lg md:text-xl">
      Rabbit Coin
    </span>

    <span className="bg-red-500/20 border border-red-400/40 text-red-300 px-3 py-2 rounded-lg text-xs md:text-sm font-bold">
      SELL ENDED
    </span>
  </nav>
</div>

{/* Sell Ended Section */}
<div className="md:mt-16 mt-8 md:px-5 px-3 pb-12">
  <div className="bg-[#320E39] rounded-2xl p-5 md:p-12">
    <div className="flex justify-center">
      <div className="bg-[#1C0A25] rounded-3xl p-6 md:p-12 w-full max-w-2xl text-center border border-[#D344B0]/30">

        <img
          src="https://nftswapstack.netlify.app/static/media/logo.3a5ddf90d6e3930972be.jfif"
          alt="Rabbit Coin"
          className="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-6"
        />

        <span className="inline-block bg-red-500/15 text-red-300 border border-red-400/30 rounded-full px-4 py-2 text-xs font-bold tracking-widest mb-5">
          SELLING CLOSED
        </span>

        <h1 className="text-3xl text-red-500 md:text-5xl font-extrabold mb-5">
          Rabbit Coin Sell Ended
        </h1>

        <p className="text-gray-300 text-sm md:text-lg leading-7 max-w-xl mx-auto">
          The Rabbit Coin selling period has ended. Thank you to
          everyone who participated and supported the project.
        </p>

        <div className="bg-[#2B1A37] rounded-xl p-5 mt-8">
          <p className="text-gray-400 text-sm mb-2">
            Rabbit Coin
          </p>
          <p className="text-white text-xl font-bold">
            Selling Is Closed
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Wallet connections and sell transactions are no longer available.
          </p>
        </div>

        <a
          href="https://t.me/rabbiitcoin"
          target="_blank"
          rel="noreferrer"
          className="mt-7 inline-flex items-center justify-center gap-2 bg-[#D344B0] hover:opacity-90 text-white font-bold px-7 py-3 rounded-xl transition"
        >
          <FaTelegram className="text-xl" />
          Contact Us
        </a>

      </div>
    </div>
  </div>
</div>
    </div>
  )
}

export default Ended
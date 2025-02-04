import fetch from 'node-fetch';
import { ethers } from 'ethers';
import readline from 'readline';
import fs from 'fs';
import { HttpsProxyAgent } from 'https-proxy-agent';
import cfonts from "cfonts";
import chalk from 'chalk';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const proxies = fs.existsSync('proxies.txt') ? fs.readFileSync('proxies.txt', 'utf-8').split('\n').filter(p => p.trim() !== '') : [];

const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.5 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPad; CPU OS 15_5 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
];

const firstNames = [
    "John", "Jane", "Michael", "Sarah", "David", "Emily", "Robert", "Jessica",
    "Daniel", "Emma", "Matthew", "Olivia", "James", "Sophia", "Andrew", "Isabella",
    "Ethan", "Mia", "Alexander", "Charlotte", "Benjamin", "Amelia", "Jacob", "Harper",
    "William", "Evelyn", "Joseph", "Abigail", "Samuel", "Ella"
];

const lastNames = [
    "Smith", "Johnson", "Brown", "Williams", "Jones", "Davis", "Miller", "Wilson",
    "Anderson", "Taylor", "Thomas", "Moore", "Martin", "White", "Harris", "Clark",
    "Lewis", "Robinson", "Walker", "Perez", "Hall", "Young", "Allen", "King",
    "Wright", "Scott", "Green", "Baker", "Adams", "Nelson"
];

function getRandomFullName() {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${firstName}${lastName}`;
}

function getRandomUserAgent() {
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}
cfonts.say('NT Exhaust', {
    font: 'block',        // Options: 'block', 'simple', '3d', etc.
    align: 'center',
    colors: ['cyan', 'magenta'],
    background: 'black',
    letterSpacing: 1,
    lineHeight: 1,
    space: true,
    maxLength: '0',
  });
console.log(chalk.green("=== Telegram Channel : NT Exhaust ( @NTExhaust ) ==="))
rl.question('Enter referral code: ', (referralCode) => {
    rl.question('Enter number of loops: ', (loopCount) => {
        const API_URL = "https://kaleidofinance.xyz/api/testnet/register";

        function getRandomEmail() {
            const randomStr = Math.random().toString(36).substring(2, 10);
            return `${getRandomFullName()}${randomStr}@gmail.com`;
        }

        function generateWalletAddress() {
            const randomWallet = ethers.Wallet.createRandom();
            return randomWallet.address;
        }

        async function registerUser() {
            for (let i = 0; i < parseInt(loopCount); i++) {
                const proxy = proxies.length > 0 ? proxies[i % proxies.length] : null;
                const agent = proxy ? new HttpsProxyAgent(proxy) : undefined;
                const userAgent = getRandomUserAgent();

                console.log(`\n🔄 Attempt ${i + 1}/${loopCount}`);
                if (proxy) console.log(`🌐 Using proxy: ${proxy}`);

                const payload = {
                    email: getRandomEmail(),
                    walletAddress: generateWalletAddress(),
                    socialTasks: { twitter: true, telegram: true, discord: true },
                    agreedToTerms: true,
                    referralCode: "",
                    referralCount: 0,
                    referralBonus: 0,
                    xUsername: getRandomFullName(),
                    referredBy: referralCode
                };

                console.log(`📩 Sending registration request for ${payload.email}...`);

                try {
                    const response = await fetch(API_URL, {
                        method: 'POST',
                        headers: {
                            'Accept': '*/*',
                            'Accept-Encoding': 'gzip, deflate, br, zstd',
                            'Accept-Language': 'en-US,en;q=0.9',
                            'Content-Type': 'application/json',
                            'Origin': 'https://kaleidofinance.xyz',
                            'Referer': `https://kaleidofinance.xyz/testnet?ref=${referralCode}`,
                            'Sec-CH-UA': '"Not A(Brand";v="8", "Chromium";v="132", "Microsoft Edge";v="132"',
                            'Sec-CH-UA-Mobile': '?0',
                            'Sec-CH-UA-Platform': '"Windows"',
                            'Sec-Fetch-Dest': 'empty',
                            'Sec-Fetch-Mode': 'cors',
                            'Sec-Fetch-Site': 'same-origin',
                            'User-Agent': userAgent
                        },
                        body: JSON.stringify(payload),
                        agent
                    });

                    if (response.status === 200 | response.status === 201) {
                        console.log(`✅ Success: ${payload.email} registered successfully!`);
                    } else if (response.status === 504) {
                        console.log(`⚠️ Gateway Timeout (504), retrying...`);
                        i--;
                    } else {
                        console.log(`❌ Failed with status ${response.status}:`, await response.text());
                    }
                    console.log("Waiting 1 minutes before the next Referral...");
                    await new Promise(resolve => setTimeout(resolve, 1 * 60 * 1000));
                } catch (error) {
                    console.error(`❌ Error: ${error.message}`);
                }
            }
            rl.close();
        }

        registerUser();
    });
});

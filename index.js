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
];

const names = ["JohnDoe", "JaneSmith", "MichaelBrown", "EmilyDavis"];

function getRandomUserAgent() {
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function getRandomEmail() {
    const randomStr = Math.random().toString(36).substring(2, 10);
    return `${names[Math.floor(Math.random() * names.length)]}${randomStr}@gmail.com`;
}

function generateWallet() {
    const wallet = ethers.Wallet.createRandom();
    return {
        address: wallet.address,
        phrase: wallet.mnemonic.phrase,
        privateKey: wallet.privateKey
    };
}

function saveAccount(wallet, email) {
    const accountInfo = `Email: ${email}\nWallet Address: ${wallet.address}\nPhrase: ${wallet.phrase}\nPrivate Key: ${wallet.privateKey}\n----------------------\n`;
    fs.appendFileSync('accounts.txt', accountInfo);
}

cfonts.say('Sogni Bot', {
    font: 'block',
    align: 'center',
    colors: ['cyan', 'magenta'],
    background: 'black'
});
console.log(chalk.green("=== Sogni Referral Bot ==="));

rl.question('Enter referral code: ', (referralCode) => {
    rl.question('Enter number of loops: ', (loopCount) => {
        const API_URL = "https://app.sogni.ai/api/register"; // Change this to the actual API URL of Sogni

        async function registerUser() {
            for (let i = 0; i < parseInt(loopCount); i++) {
                const proxy = proxies.length > 0 ? proxies[i % proxies.length] : null;
                const agent = proxy ? new HttpsProxyAgent(proxy) : undefined;
                const userAgent = getRandomUserAgent();
                const email = getRandomEmail();
                const wallet = generateWallet();

                console.log(`\n🔄 Attempt ${i + 1}/${loopCount}`);
                if (proxy) console.log(`🌐 Using proxy: ${proxy}`);
                console.log(`📩 Sending registration request for ${email}...`);

                const payload = {
                    email,
                    walletAddress: wallet.address,
                    referralCode: referralCode,  // Using the referral code from input
                    socialTasks: { twitter: true, telegram: true, discord: true },
                    agreedToTerms: true,
                    referredBy: referralCode
                };

                try {
                    const response = await fetch(API_URL, {
                        method: 'POST',
                        headers: {
                            'Accept': '*/*',
                            'Content-Type': 'application/json',
                            'Origin': 'https://app.sogni.ai',  // Replace this with Sogni's actual origin if necessary
                            'User-Agent': userAgent
                        },
                        body: JSON.stringify(payload),
                        agent
                    });

                    if (response.status === 200 || response.status === 201) {
                        console.log(`✅ Success: ${email} registered successfully!`);
                        saveAccount(wallet, email);
                    } else {
                        console.log(`❌ Failed with status ${response.status}:`, await response.text());
                    }
                    console.log("Waiting 1 minute before the next referral...");
                    await new Promise(resolve => setTimeout(resolve, 60000));  // 1 minute delay
                } catch (error) {
                    console.error(`❌ Error: ${error.message}`);
                }
            }
            rl.close();
        }

        registerUser();
    });
});

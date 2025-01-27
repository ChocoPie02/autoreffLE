import chalk from "chalk";
import fs from "fs";
import { layerEdgeRefferal } from "./classes/layerEdge";
import { getRandomProxy, loadProxies } from "./classes/proxy";
import { logMessage, prompt, rl } from "./utils/logger";

async function main(): Promise<void> {
  console.log(
    chalk.cyan(`
░█░░░█▀█░█░█░█▀▀░█▀▄░░░█▀▀░█▀▄░█▀▀░█▀▀
░█░░░█▀█░░█░░█▀▀░█▀▄░░░█▀▀░█░█░█░█░█▀▀
░▀▀▀░▀░▀░░▀░░▀▀▀░▀░▀░░░▀▀▀░▀▀░░▀▀▀░▀▀▀
        By : El Puqus Airdrop
        github.com/ahlulmukh
  `)
  );

   // Ambil argumen dari command line
  const args = process.argv.slice(2); // Mengambil argumen setelah path script
  let refCode: string;
  let count: number;
  // Cek apakah argumen untuk refCode ada
  if (args[0]) {
    refCode = args[0]; // Menggunakan argumen pertama sebagai refCode
  } else {
      refCode = await prompt(chalk.yellow("Enter Referral Code: "));
  }
  if (args[1]) {
    count = parseInt(args[1]); // Menggunakan argumen kedua sebagai count
  } else {
      count = parseInt(await prompt(chalk.yellow("How many do you want? ")));
  }
  // Tampilkan hasil
  console.log(`Referral Code: ${refCode}`);
  console.log(`Jumlah: ${count}`);
  const proxiesLoaded = loadProxies();
  if (!proxiesLoaded) {
    console.log(chalk.yellow("No proxy available. Using default IP."));
  }
  let successful = 0;

  const accountsLayerEdge = fs.createWriteStream("accounts.txt", { flags: "a" });

  for (let i = 0; i < count; i++) {
    console.log(chalk.white("-".repeat(85)));
    logMessage(i + 1, count, "Process", "debug");

    const currentProxy = await getRandomProxy();
    const layerEdge = new layerEdgeRefferal(refCode, currentProxy);

    const valid = await layerEdge.checkInvite();
    if (valid) {
      const registerSuccess = await layerEdge.regsiterWallet();
      if (registerSuccess) {
        successful++;
        const wallet = layerEdge.getWallet();
        accountsLayerEdge.write(`Wallet Address : ${wallet.address}\nPrivate Key : ${wallet.privateKey}\n`);
        accountsLayerEdge.write(`===================================================================\n`);
        const nodeConnected = await layerEdge.connectNode();
        if (nodeConnected) {
          await layerEdge.cekNodeStatus();
        }
      }
    }
  }

  accountsLayerEdge.end();

  console.log(chalk.magenta("\n[*] Dono bang!"));
  console.log(chalk.green(`[*] Account dono ${successful} dari ${count} akun`));
  console.log(chalk.magenta("[*] Result in accounts.txt"));
  rl.close(); 
}

main().catch((err) => {
  console.error(chalk.red("Error occurred:"), err);
  process.exit(1);
});

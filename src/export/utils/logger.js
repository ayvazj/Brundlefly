﻿function LogLevel() {
}
LogLevel.DEBUG = 1;
LogLevel.INFO = 2;
LogLevel.WARN = 3;
LogLevel.ERROR = 4;
LogLevel.FATAL = 5;

function Logger(level) {
    this.level = level || 0;
    this.mute = false;
}

Logger.prototype.inspect = function (object) {
    try {
        for (var prop in object) {
            this.puts(prop);
        }
    }
    catch (err) {
        this.puts(err);
    }
};

Logger.prototype.log = function (message) {
    if (!this.mute) {
        $.writeln(message);
    }
};

Logger.prototype.debug = function (message) {
    if (this.level) {
        $.writeln(message);
    }
};

Logger.prototype.printprops = function (parent) {
    //this.log("\n\n>>>>>>>>>>");
    for (var i = 1; i <= parent.numProperties; ++i) {
        var prop = parent.property(i);
        this.log(prop.matchName);
    }
    //this.log("<<<<<<<<<<\n\n");
};


if (!console) {
    var console = new Logger(LogLevel.DEBUG);
}
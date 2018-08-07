#!/usr/bin/env bash

git pull

export PORT=8000
export NODE_ENV=production

pid="`netstat -tlanp | grep LISTEN | grep ${PORT} | sed -r 's/^.+ ([0-9]+)\/.+$/\1/'`"

if [ $pid ]; then
  kill $pid
  echo "process has been stoped. [$pid]"
else
  echo "process is not running."
fi

# 切换到当前代码根目录
cd "$(dirname $0)/.."
# 创建nohup目志输出目录
mkdir -p ./nohup.out.d
# 当前日期
current=`date +%F`

nohup npm start --brandfootprint </dev/null &>> ./nohup.out.d/${current}-p${PORT} &

echo "process has been started."

ps aux | grep node | grep brandfootprint
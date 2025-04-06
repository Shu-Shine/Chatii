// server/utils/allChat.js
const User = require('../models/user');
const bcrypt = require('bcrypt');

const ALL_CHAT_AVATAR_DEFAULT = ' ';
const ALL_CHAT_EMAIL = process.env.ALL_CHAT_EMAIL;

let allChatUser = null; // 缓存 ALL_CHAT 用户

async function findOrCreateAllChat() {
  if (allChatUser) return allChatUser; 

  const allChatname = 'ALL_CHAT';
  let user = await User.findOne({ username: allChatname });

  if (!user) {
    console.log('Creating ALL_CHAT User...');
    const password = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    user = new User({
      username: allChatname,
      email: ALL_CHAT_EMAIL,
      password: hashed,
      avatarimage: ALL_CHAT_AVATAR_DEFAULT,
    });

    await user.save();
    console.log('ALL_CHAT User Created:', user._id);
  } else {
    console.log('ALL_CHAT User Found:', user._id);
  }

  allChatUser = user; // 缓存以供复用
  return user;
}

module.exports = { findOrCreateAllChat, };

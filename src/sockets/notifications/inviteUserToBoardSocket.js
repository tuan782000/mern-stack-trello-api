
/**
* @param socket from socket.jo library
*/
const inviteUserToBoardSocket = (socket) => {
  // Lắng nghe sự kiện có tên là "c_user_invited_to_board" từ phía client emit lên
  socket.on('c_user_invited_to_board', (invitation) => {
    console.log(invitation)
    // Emit ngược lại một sự kiện có tên là "s_user_invited_to_board" về cho client khác (ngoại trừ chính thằng user gửi lên)
    socket.broadcast.emit('s_user_invited_to_board', invitation)
  })
}

export default inviteUserToBoardSocket



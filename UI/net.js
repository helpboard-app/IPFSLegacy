import {joinRoom} from 'https://cdn.skypack.dev/pin/trystero@v0.11.8-pxKZpWfVVzXootkGlZMp/mode=imports/optimized/trystero/ipfs.js'
const baseConfig = {appId: 'HelpboardLegacy'}

const net = {
    Board: function({boardid, cb, name}){
        this.statusHandler = function(status){
            return status;
        }
        this.db = new PouchDB('board' + boardid);
        this.boardsdb = new PouchDB('boards');
        this.network = joinRoom(baseConfig, boardid.toString())
        this.boardid = boardid

        this.network.onPeerJoin(peerId => console.log(`${peerId} joined`))
        this.network.onPeerLeave(peerId => console.log(`${peerId} left`))

        const [sendTrigger, handleTrigger] = this.network.makeAction('adminTrigger')
        this.network.onPeerJoin(peerId => {
            console.log(`sent action trigger to ${peerId}`)
            sendTrigger({test: "send future data here"}, peerId)
        })
        

        this.boardsdb.get(boardid.toString()).then(function (doc) {
            cb({status: "initalized"})
          }).catch(function (err) {
            var boardsdb = new PouchDB('boards');
            var db = new PouchDB('board' + boardid);
            if (err.status === 404) {
                boardsdb.put({
                    _id: boardid.toString(),
                    boardID: boardid.toString(),
                    name: name,
                }).then(function (doc) {
                    db.put({
                        _id: "manageboard",
                        boardID: boardid.toString(),
                        name: name,
                        socreq: false
                    }).then(function (doc) {
                        cb({status: "initalized"})
                    })
                })
            } else {
              console.log('Error checking for document:', err);
              cb({status: "failedinit"})
              //this.statusHandler({status: false, err: `Error checking for document: ${err}`})
            }
        });
    },
    Client: function({boardid, cb}){
        this.statusHandler = function(status){
            return true;
        }
        this.network = joinRoom(baseConfig, boardid.toString())
        this.boardid = boardid
        this.connectedToAdmin = false
        this.adminPeerID = null
        const [sendTrigger, handleTrigger] = this.network.makeAction('adminTrigger')
        handleTrigger((data, peerId) => {
            this.connectedToAdmin = true
            this.adminPeerID = peerId
            cb({status: "initalized"})
        })
    }
}

export {net}
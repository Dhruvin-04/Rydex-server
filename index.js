import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import http from 'http'
import { Server } from 'socket.io'
import User from './models/user.model.js'
dotenv.config()

const port = process.env.PORT || 5000
const mongoDbUrl = process.env.MONGODB_URL

const connectDB = async (param) => {
    try{
        await mongoose.connect(mongoDbUrl)
        console.log('Connected to MongoDB')
    }catch(err){
        console.error('Error connecting to MongoDB:', err)
    }
}

const app = express()
app.use(express.json())
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: process.env.NEXT_BASE_URL,
    }
})

app.post('/emit', async (req, res) => {
    const { event, userId, data } = req.body
    try {
        const user = await User.findById(userId)
        if (user && user.socketId) {
            io.to(user.socketId).emit(event, data)
            res.status(200).json({ message: 'Event emitted successfully' })
        } else {
            res.status(404).json({ message: 'User not found or not connected' })
        }
    }catch (error) {
        console.error('Error emitting event:', error)
        res.status(500).json({ message: 'Internal Server Error' })
    }
})

io.on('connection', (socket) => {
    
    socket.on('identity', async (userId) => {
        socket.userId = userId
        await User.findByIdAndUpdate(userId, {
            socketId: socket.id,
            isOnline: true
        })
    })

    socket.on('join-ride', (bookingId) => {
        console.log(`User ${socket.id} joining room ride-${bookingId}`)
        socket.join(`ride-${bookingId}`)
    })

    socket.on('driver-location-update', ({bookingId, latitude, longitude, status}) => {
        io.to(`ride-${bookingId}`).emit('driver-location', {latitude, longitude})
    })

    socket.on('geoUpdateLoc', async ({userId, latitude, longitude}) => {
        if(!socket.userId) return;
        await User.findByIdAndUpdate(userId, {
            location: {
                type: 'Point',
                coordinates: [longitude, latitude]
            }
        })
    })

    socket.on('chat-message', async (data) => {
        console.log(`Broadcasting chat-message to room ride-${data.bookingId}:`, data.text)
        io.to(`ride-${data.bookingId}`).emit('chat-message', data)
    })

    socket.on('disconnect', async () => {
        if(!socket.userId) return;
        await User.findByIdAndUpdate(socket.userId, {
            socketId: null,
            isOnline: false
        })
    })
})

server.listen(port, () => {
    connectDB()
    console.log(`Server is running on port ${port}`)
})

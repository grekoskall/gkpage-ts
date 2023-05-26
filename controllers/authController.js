const Name = require('../models/Name')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// @desc Login
// @route POST /auth
// @access Public
const login = async (req, res) => {
    const { name, password } = req.body
    if (!name || !password) {
        return res.status(400).json({ message: 'Missing information' })
    }
    const foundName = await Name.findOne({ name }).exec()

    if ( !foundName || !foundName.active ) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const match = await bcrypt.compare(password, foundName.password)
    const match2 = (password === foundName.password)
    if (!match && !match2) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const accessToken = jwt.sign(
        {
            "NameInfo": {
                "name": foundName.name,
                "roles": foundName.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    )
    
    const refreshToken = jwt.sign(
        {
            "name": foundName.name
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
    )

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 1 * 24 * 60 * 60 * 1000 // same as refresh token
    })

    res.json({ accessToken })
}


// @desc Refresh
// @route GET /auth/refresh
// @access Public
const refresh = (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) {
                return res.status(403).json({message: 'Forbidden'})
            }
            
            const foundName = await Name.findOne({ name: decoded.name}).exec()

            if (!foundName) {
                return res.status(401).json({message: 'Unauthorized'})
            }

            const accessToken = jwt.sign(
                {
                    "NameInfo": {
                        "name": foundName.name,
                        "roles": foundName.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            )
                res.json({ accessToken })
                
        })
    )
}

// @desc Logout
// @route POST /auth/logout
// @access Public
const logout = (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) {
        return res.sendStatus(204)
    }
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    res.json({ message: 'Logged out' })
}

module.exports = {
    login, refresh, logout
}
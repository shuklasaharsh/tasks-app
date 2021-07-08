const maintenance = (req, res, next) => {
    let value = false
    let maintenanceCheck = process.env.MAINTENANCE || value
    if (maintenanceCheck) {
        res.status(503).send("The web server is being maintained")
    } else {
        next()
    }
}

module.exports = maintenance
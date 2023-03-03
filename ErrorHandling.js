module.exports = (status, messgae) => {
    const error = new Error(messgae)
    error.statusCode = status
    
    return error
}
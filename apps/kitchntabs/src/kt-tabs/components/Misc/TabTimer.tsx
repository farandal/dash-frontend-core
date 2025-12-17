import React from "react"

const TabTimer = ({ createdAt }) => {
    const [timePassed, setTimePassed] = React.useState('')

    React.useEffect(() => {
        const updateTime = () => {
            const created = new Date(createdAt)
            const now = new Date()
            const diff = Math.floor((now.getTime() - created.getTime()) / 1000)

            const hours = Math.floor(diff / 3600)
            const minutes = Math.floor((diff % 3600) / 60)
            const seconds = diff % 60

            setTimePassed(`${hours}h ${minutes}m ${seconds}s`)
        }

        updateTime()
        const interval = setInterval(updateTime, 1000)

        return () => clearInterval(interval)
    }, [createdAt])

    return timePassed
}

export default TabTimer;
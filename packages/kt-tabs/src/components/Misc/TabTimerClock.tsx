import React from "react"

const TabTimerClock = ({ createdAt, size = 24 }) => {
    const [timePassed, setTimePassed] = React.useState(0)
    const [hourDegrees, setHourDegrees] = React.useState(0)
    const [minuteDegrees, setMinuteDegrees] = React.useState(0)

    React.useEffect(() => {
        const updateTime = () => {
            const created = new Date(createdAt)
            const now = new Date()
            const diff = Math.floor((now.getTime() - created.getTime()) / 1000 / 60) // Convert to minutes

            const elapsedMinutes = diff
            const elapsedHours = elapsedMinutes / 60

            const newHourDegrees = (elapsedHours % 12) * 30
            const newMinuteDegrees = (elapsedMinutes % 60) * 6

            setTimePassed(diff)
            setHourDegrees(newHourDegrees)
            setMinuteDegrees(newMinuteDegrees)
        }

        updateTime()
        const interval = setInterval(updateTime, 1000)

        return () => clearInterval(interval)
    }, [createdAt])

    const getBackgroundColor = () => {
        if (timePassed >= 30) return 'red' // Red
        if (timePassed >= 15) return 'yellow' // Yellow
        return 'lightgreen' // Green
    }

    return (
        <div style={{
            width: size,
            height: size,
            borderRadius: '50%',
            border: '1px solid #333',
            position: 'relative',
            backgroundColor: getBackgroundColor(),
            transition: 'background-color 0.3s'
        }}>
            {[...Array(12)].map((_, i) => (
                <div key={i} style={{
                    display: 'block',
                    position: 'absolute',
                    width: '1px',
                    height: '1px',
                    backgroundColor: '#333',
                    borderRadius: '50%',
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 30}deg) translate(${size / 2 - 2}px, 0)`,
                }} />
            ))}
            <div style={{
                position: 'absolute',
                display: 'block',
                width: '1px',
                height: '30%',
                backgroundColor: '#333',
                top: '20%',
                left: '50%',
                transformOrigin: 'bottom',
                transform: `translateX(-50%) rotate(${hourDegrees}deg)`,
                zIndex: 1
            }} />
            <div style={{
                position: 'absolute',
                display: 'block',
                width: '1px',
                height: '40%',
                backgroundColor: '#333',
                top: '10%',
                left: '50%',
                transformOrigin: 'bottom',
                transform: `translateX(-50%) rotate(${minuteDegrees}deg)`,
                zIndex: 1
            }} />
            <div style={{
                position: 'absolute',
                display: 'block',
                width: '2px',
                height: '2px',
                backgroundColor: '#333',
                borderRadius: '50%',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2
            }} />
        </div>
    )
}

export default TabTimerClock;
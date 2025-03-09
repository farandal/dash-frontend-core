import { useState, useEffect, useContext } from 'react';
import { difference, pull } from 'lodash';
import usePrevious from '@rooks/use-previous';
import { Channel } from 'laravel-echo/src/channel';
import socketio from 'socket.io-client/dist/socket.io.js';
import Echo from 'laravel-echo';
import moment from 'moment';
import { ConstantsContext } from '../../config/ConstantsService';

const useLaravelEcho = ({
	type,
	channel,
	events,
	userId,
	socketId,
}: {
	type: 'public' | 'private';
	channel: string;
	events: { [key: string]: (e: any) => any };
	userId?: number;
	socketId?: string;
}) => {
	const [echoChannel, setEchoChannel] = useState<Channel>();
	const [laravelEchoClient, setLaravelEchoClient] = useState<Echo>(null);
	const [currentEvents, setCurrentEvents] = useState([]);
	const prevChannel = usePrevious(channel);
	const prevEventsKeys = usePrevious(Object.keys(events));
	const constants = useContext(ConstantsContext);

	if (!socketId)
		socketId = userId ? userId.toString() : moment().valueOf().toString();

	let token = null;

	if (userId) token = localStorage.getItem('token');

	let configObject: any = {
		broadcaster: 'socket.io',
		host: constants.systemConstants.system.SOCKET_URL || '0.0.0.0',
		socketId: socketId,
		logToConsole: true,
		transports: ['websocket'],
		auth: {
			headers: {
				authorization: 'Bearer ' + token,
			},
		},
		client: socketio,
	};

	useEffect(() => {
		if (
			constants.systemConstants.system.SOCKETS_ENABLED ===
			true /* && !socketConnectionState*/
		) {
			if (type === 'public' || (type === 'private' && userId)) {
				const socketConnectionState = JSON.parse(
					localStorage.getItem('socketConnectionState'),
				);

				if (!socketConnectionState) {
					//console.info("Conectándose al Laravel Echo ", configObject);
					setLaravelEchoClient(new Echo(configObject));
				}
			}
		}
	}, []);

	useEffect(() => {
		if (!laravelEchoClient) return;
		if (type === 'private' && !userId) return;
		// if the channel changed, disconnect before setting up the new connection
		if (echoChannel && channel !== prevChannel) {
			laravelEchoClient && laravelEchoClient.leaveChannel(prevChannel);
		}

		if (!echoChannel || channel !== prevChannel) {
			//echoChannel && echoChannel.disconnect();
			//console.info(`conectando al canal ${channel}`)
			if (type === 'private')
				laravelEchoClient && setEchoChannel(laravelEchoClient.private(channel));
			if (type === 'public')
				laravelEchoClient && setEchoChannel(laravelEchoClient.channel(channel));
		}

		return () => {
			// TODO! not tested
			/* if (echoChannel) {
        echoChannel.disconnect();
      }*/
			//console.info("desconectando el canal no implementado");
			//setEchoChannel(null);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [laravelEchoClient, channel]);

	useEffect(() => {
		if (!laravelEchoClient) return;
		if (!userId) return;
		if (constants.systemConstants.system.SOCKETS_ENABLED === false) return;

		if (echoChannel && events) {
			const eventsKeys = Object.keys(events);
			const droppedEvents = difference(currentEvents, eventsKeys);
			const newEvents = difference(eventsKeys, currentEvents);
			if (droppedEvents && droppedEvents.length) {
				setCurrentEvents((state) => {
					droppedEvents.forEach((de) => pull(state, de));
					return state;
				});
			}
			if (newEvents && newEvents.length) {
				setCurrentEvents((state) => {
			
					newEvents.forEach((ne) => {
						localStorage.setItem('socketConnectionState', 'true');
						/** @ts-ignore */
						if (!echoChannel.listeners.hasOwnProperty(ne)) {
							state.push(ne);
							echoChannel.listen('.' + ne, events[ne]);
						}
					});
					return state;
				});
			}
		}

		/*return function () {
      if (echoChannel && events) {
        Object.keys(echoChannel.listeners).forEach(listenerName => {
          console.log("events:", events);
          console.log("currentEvents", currentEvents);
          console.log("LISTENER NAME", listenerName);
        });
      }
    };*/
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [echoChannel, Object.keys(events) === prevEventsKeys]);
};

export default useLaravelEcho;

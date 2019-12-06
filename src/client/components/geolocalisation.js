import React, {useEffect, useState} from "react";

//usestate créé une variable et apres on peut la modifier avec le deuxieme e du tableau

function WatchID() {
    const [position, setPosition] = useState({
        longitude: 0,
        latitude: 0,
    });

    useEffect(() => {
        navigator.geolocation.watchPosition(pos => {
            setPosition(pos.coords);
            /*     console.log(pos.coords.latitude, pos.coords.longitude); */
        });
    }, []);

    return (
        <div>
            <p>{`votre latitude est ${position.latitude}`}</p>
            <p>{`votre longitude est ${position.longitude}`}</p>
        </div>
    );
}

// let Localisation = watchID();
export default WatchID;
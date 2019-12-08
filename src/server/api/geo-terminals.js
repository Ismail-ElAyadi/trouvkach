export default async (req, res) => {
    const longitude = parseFloat(req.params.longitude) || 50.6593305;
    const latitude = parseFloat(req.params.latitude) || 5.5995275;
    const zoom = parseFloat(req.params.zoom) || 1;

    // Terminals
    const Terminals = req.db.collection("terminals");

    // haversine’ formula
    // https://stackoverflow.com/a/365853
    const terminals = await Terminals.aggregate([
        {
            $addFields: {
                // dLat
                dLat: {
                    $divide: [
                        {
                            $multiply: [
                                {
                                    $subtract: [latitude, "$latitude"],
                                },
                                Math.PI,
                            ],
                        },
                        180,
                    ],
                },

                // dLon
                dLon: {
                    $divide: [
                        {
                            $multiply: [
                                {
                                    $subtract: [longitude, "$longitude"],
                                },
                                Math.PI,
                            ],
                        },
                        180,
                    ],
                },

                // lat1
                lat1: {
                    $divide: [
                        {
                            $multiply: ["$latitude", Math.PI],
                        },
                        180,
                    ],
                },

                // lat 2
                lat2: {
                    $divide: [
                        {
                            $multiply: [latitude, Math.PI],
                        },
                        180,
                    ],
                },
            },
        },
        {
            $addFields: {
                a: {
                    $add: [
                        {
                            $multiply: [
                                {
                                    $sin: {
                                        $divide: ["$dLat", 2],
                                    },
                                },
                                {
                                    $sin: {
                                        $divide: ["$dLat", 2],
                                    },
                                },
                            ],
                        },
                        {
                            $multiply: [
                                {
                                    $cos: "$lat1",
                                },
                                {
                                    $cos: "$lat2",
                                },
                                {
                                    $sin: {
                                        $divide: ["$dLon", 2],
                                    },
                                },
                                {
                                    $sin: {
                                        $divide: ["$dLon", 2],
                                    },
                                },
                            ],
                        },
                    ],
                },
            },
        },
        {
            $addFields: {
                c: {
                    $multiply: [
                        2,
                        {
                            $atan2: [
                                {
                                    $sqrt: "$a",
                                },
                                {
                                    $sqrt: {
                                        $subtract: [1, "$a"],
                                    },
                                },
                            ],
                        },
                    ],
                },
            },
        },
        {
            $project: {
                bank: 1,
                address: 1,
                longitude: 1,
                latitude: 1,
                distance: {
                    $trunc: [
                        {$divide: [{$multiply: ["$c", 6378137]}, 1000]}, // km
                        2,
                    ],
                },
            },
        },
        {
            $match: {
                distance: {$lte: zoom},
            },
        },
    ])
        .sort({
            distance: 1,
        })
        .toArray();

    // Send to client
    res.json({
        data: terminals,
    });
};

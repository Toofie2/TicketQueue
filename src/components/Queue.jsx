import '../index.css';

function Queue() {
    const positionNumber = 1245;
    const waitTime = 59;

    const outerBoxStyle = {
        backgroundColor: '#1b2b36',
        borderRadius: '24px',
        padding: '30px',
        maxWidth: '400px',
        width: '90%',
        margin: '0 auto',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
    };

    const innerBoxStyle = {
        borderBottom: '2px solid #c59648',
        paddingBottom: '20px',
        marginBottom: '20px'
    };

    const labelStyle = {
        color: '#d9d9d9',
        fontFamily: "'Nunito', sans-serif",
        fontWeight: '800',
        margin: '10px 0'
    };

    const positionStyle = {
        color: '#c59648',
        marginLeft: '8px',
        fontSize: '32px',
        fontWeight: '900'
    };    

    const waitTimeStyle = {
        color: '#d9d9d9',
        marginLeft: '8px',
        fontSize: '32px',
        fontWeight: '900'
    };   
        
    return (
        <div className="queue-page-container" style={{ padding: '40px 0' }}>
            <div className="queue-top-text" style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h2 style={{ color: '#1b2b36' }}>🏆 Good news! You are now in line. 🏆</h2>
            </div>
            
            <div style={outerBoxStyle}>
                
                <div style={innerBoxStyle}>
                    <h1 style={labelStyle}>Your spot in line:
                    </h1>
                    <h1 style={{ ...positionStyle, fontSize: '40px'}}>
                        #{positionNumber}
                    </h1>
                    <h1 style = {labelStyle}>World Cup 2026: General Admission</h1>
                </div>
                
                <div>
                    <h3 style = {{ ...waitTimeStyle, fontSize: '25px', color: '#98a69d'}}>Your estimated wait time: 
                        <span style={waitTimeStyle}>{waitTime} mins</span>
                    </h3>
                </div>
            </div>
            
            <main className="content-spacer"></main>
            <div className="graphic-backdrop"></div>
        </div>
    );
}

export default Queue;

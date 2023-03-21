

const Button = ({state, onClick, text}) => {


    return (
        <button
            className="header-button"
            style={{display:  state ? "none": ""}}
            onClick={onClick}
        >
            <i className="fa fa-times"/>
            <span>{text}</span>
        </button>


    )


}

export default Button
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.output_parsers import ResponseSchema
from langchain.output_parsers import StructuredOutputParser
from langchain.chains import SequentialChain, TransformChain, LLMChain
from typing import Dict, Tuple

try:
    from secret_api_keys import OPEN_AI_API_KEY
except ImportError:
    OPEN_AI_API_KEY = "<key>"

# import parsy

MODEL = "gpt-3.5-turbo"
verbose = False
# imports the open ai model into langchain
# temperature of 0 means the responses will be less varied (which we want)
# model is set to gpt 3.5
llm = ChatOpenAI(openai_api_key=OPEN_AI_API_KEY, temperature=0, model=MODEL)


def get_raw_prereqs_and_coreqs(verbose=False) -> SequentialChain:
    """
    Returns a chain that takes in a course description and returns the prerequisites and corequisites as two separate lists.
    """
    template = """
    Return the course names that are required prerequisites for this class as list of strings. Do the same for corequisites.
    Ignore any recommendations for prerequisites or corequisites.
    A course name consists of an abbreviation in all capital letters and a 4 digit number.
    {format_instructions}

    Input: {course_desc}
    Output:
    """

    # sets up the structure of the json that should be returned as a response
    prereqs_response = ResponseSchema(
        name="prerequisites",
        description="Possibly empty list of course names that are prerequisites for the class.",
    )

    coreqs_response = ResponseSchema(
        name="corequisites",
        description="Possibly empty list of course names that are corequisites for the class.",
    )

    response_schemas = [prereqs_response, coreqs_response]

    # instructions for formatting output as json with two fields
    output_parser = StructuredOutputParser.from_response_schemas(response_schemas)
    format_instructions = output_parser.get_format_instructions()

    prompt = PromptTemplate(
        template=template,
        input_variables=["course_desc"],
        partial_variables={"format_instructions": format_instructions},
    )

    # llm chain to turn course desc into prerequisites + corequisites
    llm_chain = LLMChain(
        prompt=prompt, llm=llm, output_key="prerequisites_corequisites_json_str"
    )

    # parse out prerequisites + corequisites from dict with one key value pair
    # key is the output from the llm_chain, which is prerequisites_corequisites_json_str
    # value is the json string that we want to parse into a dict
    def parse_prerequisites_corequisites(inputs: Dict[str, str]):
        text = inputs["prerequisites_corequisites_json_str"]
        return output_parser.parse(text)

    # pass in parse_prerequisites_corequisites as a function as input to the TransformChain
    parse_chain = TransformChain(
        input_variables=["prerequisites_corequisites_json_str"],
        output_variables=["prerequisites", "corequisites"],
        transform=parse_prerequisites_corequisites,
    )

    # combines chains to go from course_desc -> json_str w/prereqs + coreqs -> prereqs + coreqs
    raw_prereqs_coreqs_chain = SequentialChain(
        chains=[llm_chain, parse_chain],
        input_variables=["course_desc"],
        output_variables=["prerequisites", "corequisites"],
        verbose=verbose,
    )
    return raw_prereqs_coreqs_chain


def get_prereqs_coreqs(course_desc: str, verbose=False) -> Tuple[str]:
    """
    Takes in a course description and returns a boolean expression with the course names representing the prerequisites and corequisites.
    """
    raw_prereqs_coreqs_chain = get_raw_prereqs_and_coreqs(verbose)

    template = """
    You are given the course description for a course.
    You are also given the prerequisites and corequisites for a course as two lists of strings, each string representing the course name.
    Return a boolean expression as a string with the necessary parentheses and AND and OR operators that represents the prerequisites required for this course. Do the same for the corequisites.
    {format_instructions}
    Here are some examples

    Course Description: Prerequisite: CS 2110 or equivalent programming experience. Prerequisite or corequisite: CS 2800. Should not be taken concurrently with CS 3410 or CS 3420.
    Prerequisites: ["CS 2110"]
    Corequisites: ["CS 2800"]
    Output:
    ```json
    {{
        "parsed_prerequisites": "CS 2110",
        "parsed_corequisites": "CS 2800"
    }}
    ```

    Course Description: Prerequisite: MATH 4710, ENGRD 2700 or equivalent, MATH 1920 or equivalent, MATH 2940, MATH 2210 or equivalent, and CS 1110, CS 1133 or equivalent.
    Prerequisites: ["MATH 4710", "ENGRD 2700", "MATH 1920", "MATH 2940", "MATH 2210", "CS 1110", "CS 1113"]
    Corequisites: []
    Output:
    ```json
    {{
        "parsed_prerequisites": "(MATH 4710 OR ENGRD 2700) AND (MATH 1920) AND (MATH 2940 OR MATH 2210) AND (CS 1110 OR CS 1113)",
        "parsed_corequisites": ""
    }}
    ```

    Course Description: {course_desc}
    Prerequisites: {prerequisites}
    Corequisites: {corequisites}
    Output:
    """

    # sets up the structure of the json that should be returned as a response
    prereqs_response = ResponseSchema(
        name="parsed_prerequisites",
        description="Possibly empty string that represents a boolean expression for the prerequisites",
    )

    coreqs_response = ResponseSchema(
        name="parsed_corequisites",
        description="Possibly empty string that represents a boolean expression for the corequisites",
    )

    response_schemas = [prereqs_response, coreqs_response]

    # instructions for formatting output as json with two fields
    output_parser = StructuredOutputParser.from_response_schemas(response_schemas)
    format_instructions = output_parser.get_format_instructions()

    prompt = PromptTemplate(
        template=template,
        input_variables=["course_desc", "prerequisites", "corequisites"],
        partial_variables={"format_instructions": format_instructions},
    )

    # llm chain to turn course desc + prerequisites + corequisites into boolean expression
    prereqs_coreqs_chain = LLMChain(
        prompt=prompt,
        llm=llm,
        output_key="parsed_prerequisites_parsed_corequisites_json_str",
    )

    # parse out parsed_prerequisites + parsed_corequisites from dict with one key value pair
    # key is the output from the llm_chain, which is parsed_prerequisites_parsed_corequisites_json_str
    # value is the json string that we want to parse into a dict
    def parse_prerequisites_corequisites(inputs: Dict[str, str]):
        text = inputs["parsed_prerequisites_parsed_corequisites_json_str"]
        return output_parser.parse(text)

    # transform chain that turns the json string and parses it into the desired dict
    # with parsed_prerequisites and parsed_corequisites as keys
    parse_prereqs_coreqs_chain = TransformChain(
        input_variables=["parsed_prerequisites_parsed_corequisites_json_str"],
        output_variables=["parsed_prerequisites", "parsed_corequisites"],
        transform=parse_prerequisites_corequisites,
    )

    # combines chains to go from course_desc -> json_str w/prereqs + coreqs ->
    # prereqs + coreqs -> json_str w/parsed_prereqs + parsed_coreqs -> parsed_prereqs + parsed_coreqs
    final_chain = SequentialChain(
        chains=[
            raw_prereqs_coreqs_chain,
            prereqs_coreqs_chain,
            parse_prereqs_coreqs_chain,
        ],
        input_variables=["course_desc"],
        output_variables=["parsed_prerequisites", "parsed_corequisites"],
        verbose=verbose,
    )

    response = final_chain({"course_desc": course_desc}, return_only_outputs=True)
    if verbose:
        print(response)

    # get final prereqs str and coreqs str
    prereqs_response = response["parsed_prerequisites"]
    coreqs_response = response["parsed_corequisites"]
    # prereqs, coreqs = parse_prereqs_coreqs(prereqs_response, coreqs_response)
    return (prereqs_response, coreqs_response)


if __name__ == "__main__":
    print(
        get_prereqs_coreqs(
            "Prerequisite: PHYS 2208 and CHEM 2080, or MATH 2130 or MATH 2310 or MATH 2220, or permission of instructor."
        )
    )
